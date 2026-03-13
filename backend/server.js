const express    = require('express');
const cors       = require('cors');
const http       = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (photos uploadées)
app.use('/uploads', express.static('uploads'));

app.set('io', io);

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/etudiants',     require('./routes/etudiants'));
app.use('/api/classes',       require('./routes/classes'));
app.use('/api/evaluations',   require('./routes/evaluations'));
app.use('/api/absences',      require('./routes/absences'));
app.use('/api/versements',    require('./routes/versements'));
app.use('/api/emploiTemps',   require('./routes/emploiTemps'));
app.use('/api/chatbot',       require('./routes/chatbot'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/professeurs',   require('./routes/professeurs'));

// Routes d'upload
const uploadRoutes = require('./routes/upload');
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.json({ message: '🎓 MyCESA API en ligne !' });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} introuvable` });
});

io.on('connection', (socket) => {
  console.log('🔌 Client connecté :', socket.id);
  socket.on('join', (userId) => socket.join('user_' + userId));
  socket.on('disconnect', () => console.log('❌ Client déconnecté :', socket.id));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════╗');
  console.log('║      🎓 MyCESA Backend démarré !      ║');
  console.log(`║   Serveur : http://localhost:${PORT}     ║`);
  console.log('╚═══════════════════════════════════════╝');
  console.log('');
});