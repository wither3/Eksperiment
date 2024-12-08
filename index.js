const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const cors = require('cors'); // Import cors
const { tiktokDl } = require('./tikwm2.js'); // Import tiktokDl

const app = express();
const db = new sqlite3.Database(':memory:'); // Atau gunakan file DB untuk persistensi

// Gunakan middleware CORS
app.use(cors());

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, message TEXT, timestamp TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS tikwm_data (id INTEGER PRIMARY KEY, url TEXT, data TEXT, timestamp TEXT)'); // Tabel untuk menyimpan data TikTok
});

app.get('/write-json', (req, res) => {
  const newMessage = req.query.req;
  if (!newMessage) {
    return res.status(400).json({ success: false, message: 'Parameter "req" is required' });
  }

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

// Endpoint untuk mengunduh data TikTok dan menyimpannya ke SQLite
app.get('/tikwm/download', async (req, res) => {
  try {
    const url = req.query.url; // Ambil URL dari query parameter
    if (!url) {
      return res.status(400).json({ error: 'URL TikTok harus diberikan dalam parameter "url".' });
    }

    console.log('Mengunduh data TikTok untuk URL:', url);

    const tikDlData = await tiktokDl(url);
    if (tikDlData) {
      console.log('Berhasil mendapatkan data TikTok:', tikDlData);

      // Simpan data TikTok ke SQLite
      const timestamp = new Date().toISOString();
      db.run('INSERT INTO tikwm_data (url, data, timestamp) VALUES (?, ?, ?)', [url, JSON.stringify(tikDlData), timestamp], function (err) {
        if (err) {
          console.error('Error saat menyimpan data TikTok:', err);
          return res.status(500).json({ error: 'Gagal menyimpan data TikTok.' });
        }
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

// Endpoint untuk membaca data TikTok yang telah disimpan
app.get('/read-tikwm', (req, res) => {
  db.all('SELECT * FROM tikwm_data', (err, rows) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ success: false, message: 'Gagal membaca data TikTok.' });
    }

    // Format data menjadi lebih rapi
    const formattedData = rows.map(row => ({
      id: row.id,
      url: row.url,
      data: JSON.parse(row.data), // Mengubah string JSON kembali menjadi objek
      timestamp: row.timestamp
    }));

    res.status(200).json({ success: true, data: formattedData });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http`);
});
