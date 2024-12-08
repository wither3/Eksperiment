const sqlite3 = require('sqlite3').verbose();
const express = require('express');

const app = express();
const db = new sqlite3.Database(':memory:'); // Atau gunakan file DB untuk persistensi

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, message TEXT, timestamp TEXT)');
});

app.get('/write-json', (req, res) => {
  const newMessage = req.query.req;
  if (!newMessage) {
    return res.status(400).json({ success: false, message: 'Parameter "req" is required' });
  }

app.get('/tikwm/download', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'URL TikTok harus diberikan dalam parameter "url".' });
    }

    const tikDlData = await tiktokDl(url);
    if (tikDlData) {
      const timestamp = new Date().toISOString();
      db.run('INSERT INTO messages (message, timestamp) VALUES (?, ?)', [tikDlData, timestamp], function (err) {
        if (err) {
          console.error('Error menyimpan data:', err);
          return res.status(500).json({ success: false, message: 'Gagal menyimpan data.' });
        }
        console.log('Berhasil menyimpan data ke database.');
        return res.status(200).json({ success: true, data: tikDlData });
      });
    } else {
      return res.status(404).json({ error: 'Tidak ada data yang ditemukan untuk URL yang diberikan.' });
    }
  } catch (error) {
    console.error('Kesalahan saat mengunduh data TikTok:', error.message);
    return res.status(500).json({ error: 'Terjadi kesalahan internal server.', detail: error.message });
  }
});
  
  const timestamp = new Date().toISOString();
  db.run('INSERT INTO messages (message, timestamp) VALUES (?, ?)', [newMessage, timestamp], function (err) {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ success: false, message: 'Gagal menyimpan data.' });
    }
    res.status(200).json({ success: true, message: 'Data berhasil ditambahkan.', id: this.lastID });
  });
});

app.get('/read-json', (req, res) => {
  db.all('SELECT * FROM messages', (err, rows) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ success: false, message: 'Gagal membaca data.' });
    }
    res.status(200).json({ success: true, data: rows });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
