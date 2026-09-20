const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');

const router = express.Router();
const uploadDir = path.join(__dirname, '../uploads/emplois-du-temps');
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.pdf', '.xlsx', '.xls', '.docx', '.doc']);
const allowedMimeTypes = new Set([
  'image/jpeg', 'image/png', 'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]);

// Type MIME deduit de l'extension : utilise quand le client n'envoie pas de
// Content-Type pour la partie du fichier (cas des clients multipart minimalistes).
const mimeParExtension = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc': 'application/msword',
};

/** Un MIME fiable est un MIME annonce par le client et reconnu. */
function mimeFiable(mimetype) {
  return allowedMimeTypes.has(String(mimetype || '').toLowerCase());
}

/**
 * L'extension est le controle principal (liste blanche ci-dessus) ; le MIME
 * annonce par le client sert d'indication, jamais de blocage, sinon un client
 * qui n'envoie pas de type (ex. HttpClient de Laravel) ne peut jamais publier.
 */
function resoudreTypeMime(originalname, mimetype) {
  if (mimeFiable(mimetype)) return mimetype;
  return mimeParExtension[path.extname(originalname).toLowerCase()] || 'application/octet-stream';
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    fs.mkdirSync(uploadDir, { recursive: true });
    callback(null, uploadDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `emploi_${Date.now()}_${Math.random().toString(36).slice(2)}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(extension)) {
      return callback(new Error('Type de fichier non autorise'));
    }
    // Le MIME annonce est bloque uniquement s'il est explicite ET inconnu :
    // un MIME absent (client multipart minimaliste) reste accepte.
    const mimeAnnonce = String(file.mimetype || '').toLowerCase();
    const mimeAbsent = !mimeAnnonce || mimeAnnonce === 'application/octet-stream';
    if (!mimeAbsent && !allowedMimeTypes.has(mimeAnnonce)) {
      return callback(new Error('Type de fichier non autorise'));
    }
    callback(null, true);
  },
});

/**
 * Construit un nom de fichier sur pour l'en-tete Content-Disposition.
 * Le nom ASCII sert de repli, le nom reel est transmis via filename* (RFC 5987).
 */
function contentDisposition(originalName, storedName, inline) {
  const fallback = String(originalName || storedName || 'emploi-du-temps')
    .replace(/[\r\n"]/g, '')
    .replace(/[^\x20-\x7E]/g, '_')
    .trim() || storedName;
  const encoded = encodeURIComponent(originalName || storedName || 'emploi-du-temps');
  const type = inline ? 'inline' : 'attachment';
  return `${type}; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

function serializeFile(row, req) {
  return {
    id: row.id,
    classe_id: row.classe_id,
    nom_fichier_original: row.nom_fichier_original,
    type_mime: row.type_mime,
    chemin_stockage: row.chemin_stockage,
    uploaded_by: row.uploaded_by,
    created_at: row.created_at,
    download_url: `${req.baseUrl}/${row.id}/download`,
    preview_url: `${req.baseUrl}/${row.id}/download?inline=1`,
    previewable: String(row.type_mime || '').startsWith('image/') || row.type_mime === 'application/pdf',
    nom_classe: row.Nom_Classe || null,
  };
}

async function getFiles(classeId, req) {
  const params = [];
  let where = '';
  if (classeId) {
    where = 'WHERE f.classe_id = ?';
    params.push(classeId);
  }
  const [rows] = await db.query(
    `SELECT f.*, c.Nom_Classe
     FROM EMPLOI_DU_TEMPS_FICHIER f
     JOIN CLASSE c ON c.Id_CLASSE = f.classe_id
     ${where}
     ORDER BY f.classe_id, f.created_at DESC, f.id DESC`,
    params,
  );
  return rows.map((row) => serializeFile(row, req));
}

router.get('/', auth, async (req, res) => {
  try {
    const files = await getFiles(req.query.classe_id, req);
    if (req.query.classe_id) {
      return res.json({
        classe_id: Number(req.query.classe_id),
        actif: files[0] || null,
        historique: files.slice(1),
      });
    }

    const byClass = files.reduce((result, file) => {
      const key = String(file.classe_id);
      if (!result[key]) result[key] = { classe_id: file.classe_id, nom_classe: file.nom_classe, actif: file, historique: [] };
      else result[key].historique.push(file);
      return result;
    }, {});
    res.json(Object.values(byClass));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const classeId = Number(req.body.classe_id);
    if (!Number.isInteger(classeId) || classeId <= 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'classe_id est requis' });
    }
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });

    const [classes] = await db.query('SELECT Id_CLASSE, Nom_Classe FROM CLASSE WHERE Id_CLASSE = ?', [classeId]);
    if (!classes.length) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Classe introuvable' });
    }

    const relativePath = path.join('uploads', 'emplois-du-temps', req.file.filename).replace(/\\/g, '/');
    const typeMime = resoudreTypeMime(req.file.originalname, req.file.mimetype);
    const [result] = await db.query(
      `INSERT INTO EMPLOI_DU_TEMPS_FICHIER
       (classe_id, nom_fichier_original, type_mime, chemin_stockage, uploaded_by)
       VALUES (?, ?, ?, ?, ?)`,
      [classeId, req.file.originalname, typeMime, relativePath, req.user.id || null],
    );
    const [rows] = await db.query(
      `SELECT f.*, c.Nom_Classe FROM EMPLOI_DU_TEMPS_FICHIER f
       JOIN CLASSE c ON c.Id_CLASSE = f.classe_id WHERE f.id = ?`,
      [result.insertId],
    );
    res.status(201).json({ fichier: serializeFile(rows[0], req) });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(error.message === 'Type de fichier non autorise' ? 400 : 500).json({ error: error.message });
  }
});

// ?inline=1 -> le navigateur affiche le fichier (apercu) au lieu de le telecharger.
router.get('/:id/download', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM EMPLOI_DU_TEMPS_FICHIER WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Fichier introuvable' });

    const fichier = rows[0];
    const absolutePath = path.join(__dirname, '..', fichier.chemin_stockage);
    if (!fs.existsSync(absolutePath)) return res.status(404).json({ error: 'Fichier absent du stockage' });

    const inline = ['1', 'true', 'inline'].includes(String(req.query.inline || '').toLowerCase());

    res.setHeader('Content-Type', fichier.type_mime || 'application/octet-stream');
    res.setHeader('Content-Disposition', contentDisposition(
      fichier.nom_fichier_original,
      path.basename(fichier.chemin_stockage),
      inline,
    ));
    res.setHeader('Cache-Control', inline ? 'private, max-age=0, must-revalidate' : 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.sendFile(absolutePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT chemin_stockage FROM EMPLOI_DU_TEMPS_FICHIER WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Fichier introuvable' });
    const absolutePath = path.join(__dirname, '..', rows[0].chemin_stockage);
    if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
    await db.query('DELETE FROM EMPLOI_DU_TEMPS_FICHIER WHERE id = ?', [req.params.id]);
    res.json({ message: 'Fichier supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;