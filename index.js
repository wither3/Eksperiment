const sqlite3 = require('sqlite3').verbose();
const express = require('express');
require('dotenv').config();

const app = express();
const dbFile = process.env.DB_FILE || 'messages.db'; // Gunakan environment variable
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, message TEXT, timestamp TEXT)');
});

app.get('/write-json', (req, res) => {
  const newMessage = req.query.req;
  if (!newMessage || typeof newMessage !== 'string') {
    return res.status(400).json({ success: false, message: 'Parameter "req" harus string dan tidak boleh kosong' });
  }

  const timestamp = new Date().toISOString();
  db.run('INSERT INTO messages (message, timestamp) VALUES (?, ?)', [newMessage, timestamp], function (err) {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ success: false, message: 'Gagal menyimpan data', error: err.message });
    }
    res.status(201).json({ success: true, message: 'Data berhasil ditambahkan.', id: this.lastID });
  });
});

app.get('/read-json', (req, res) => {
  db.all('SELECT * FROM messages', (err, rows) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ success: false, message: 'Gagal membaca data', error: err.message });
    }
    res.status(200).json({ success: true, data: rows });
  });
});

const PORT = process.env.PORT || 3000; // Gunakan environment variable
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
