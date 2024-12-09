const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { tiktokDl } = require('./tikwm2.js'); // Import fungsi TikTok downloader

const app = express();
const DB_PATH = path.join('/tmp', 'database.sqlite'); // Simpan database di folder /tmp
const dbExists = fs.existsSync(DB_PATH);
const db = new sqlite3.Database(DB_PATH); // Gunakan file database di /tmp

// Gunakan middleware CORS
app.use(cors());

// Jika database belum ada, buat tabel
if (!dbExists) {
  db.serialize(() => {
    console.log('Membuat tabel baru di database...');
    db.run('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, message TEXT, timestamp TEXT)');
    db.run('CREATE TABLE IF NOT EXISTS tikwm_data (id INTEGER PRIMARY KEY, url TEXT, data TEXT, timestamp TEXT)');
  });
}

// Endpoint untuk menulis data ke database
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

// Endpoint untuk membaca semua data dari database
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
// Endpoint untuk mengunduh data TikTok dan menyimpannya ke SQLite
// Endpoint untuk mengunduh data TikTok dan menyimpannya ke SQLite
app.get('/tikwm/download', async (req, res) => {
  try {
    const rawUrl = req.query.url;
    if (!rawUrl) {
      return res.status(400).json({ error: 'URL TikTok harus diberikan dalam parameter "url".' });
    }

    // Normalisasi URL
    const url = rawUrl.replace(/\/$/, ''); // Menghapus trailing slash jika ada

    const tikDlData = await tiktokDl(url);
    if (tikDlData) {
      const videoId = tikDlData.id;
      
      // Format timestamp ke format baru
      const dateObj = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      const tanggalDiFetch = new Intl.DateTimeFormat('id-ID', options).format(dateObj);

      // Periksa apakah data dengan ID video yang sama sudah ada
      db.get('SELECT id FROM tikwm_data WHERE data LIKE ?', [`%"id":"${videoId}"%`], (err, row) => {
        if (err) {
          console.error('Error saat memeriksa data:', err);
          return res.status(500).json({ error: 'Gagal memeriksa data TikTok.' });
        }

        if (row) {
          // Jika data sudah ada, perbarui data dan tanggalDiFetch
          db.run(
            'UPDATE tikwm_data SET url = ?, data = ?, timestamp = ? WHERE id = ?',
            [url, JSON.stringify(tikDlData), tanggalDiFetch, row.id],
            function (err) {
              if (err) {
                console.error('Error saat memperbarui data TikTok:', err);
                return res.status(500).json({ error: 'Gagal memperbarui data TikTok.' });
              }
              return res.status(200).json({ success: true, message: 'Data diperbarui.', data: { ...tikDlData, tanggalDiFetch } });
            }
          );
        } else {
          // Jika data belum ada, tambahkan entri baru
          db.run(
            'INSERT INTO tikwm_data (url, data, timestamp) VALUES (?, ?, ?)',
            [url, JSON.stringify(tikDlData), tanggalDiFetch],
            function (err) {
              if (err) {
                console.error('Error saat menyimpan data TikTok:', err);
                return res.status(500).json({ error: 'Gagal menyimpan data TikTok.' });
              }
              return res.status(200).json({ success: true, message: 'Data ditambahkan.', data: { ...tikDlData, tanggalDiFetch } });
            }
          );
        }
      });
    } else {
      return res.status(404).json({ error: 'Tidak ada data yang ditemukan untuk URL yang diberikan.' });
    }
  } catch (error) {
    console.error('Kesalahan saat mengunduh data TikTok:', error.message);
    return res.status(500).json({ error: 'Terjadi kesalahan internal server.', detail: error.message });
  }
});

// Endpoint untuk membaca data TikTok yang telah disimpan, diurutkan berdasarkan timestamp terbaru
app.get('/read-tikwm', (req, res) => {
  db.all('SELECT * FROM tikwm_data ORDER BY timestamp DESC', (err, rows) => {
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




// Endpoint untuk membaca data TikTok yang telah disimpan, diurutkan berdasarkan timestamp terbaru
app.get('/read-tikwm', (req, res) => {
  db.all('SELECT * FROM tikwm_data ORDER BY timestamp DESC', (err, rows) => {
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

// Jalankan server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
