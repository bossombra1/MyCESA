require('dotenv').config();
const db = require('./config/db');
(async () => {
  const [t] = await db.query('SHOW TABLES');
  const tables = t.map((r) => Object.values(r)[0]);
  console.log('TABLES:' + tables.join('|'));
  for (const tb of tables) {
    try {
      const [c] = await db.query('SHOW COLUMNS FROM `' + tb + '`');
      console.log('=== ' + tb + ' ===');
      console.log(c.map((x) => x.Field + (x.Key === 'PRI' ? ' [PK]' : '') + ' (' + x.Type + ')').join(', '));
    } catch (e) { console.log('ERR ' + tb + ' ' + e.message); }
  }
  process.exit(0);
})();
