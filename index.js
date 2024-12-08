const express = require('express');
const cors = require('cors');
const { tiktokDl } = require('./tikwm2.js');
const neon = require('./neon');

const app = express();

app.use(cors());

// Buat tabel jika belum ada
neon.query(`
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    message TEXT,
    timestamp TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tikwm_data (
    id SERIAL PRIMARY KEY,
    url TEXT,
    data JSONB,
    timestamp TIMESTAMP
  );
`);

// Endpoint untuk menyimpan pesan
app.get('/write-json', async (req, res) => {
  const newMessage = req.query.req;
  if (!newMessage) {
    return res.status(400).json({ success: false, message: 'Parameter "req" is required' });
  }

  try {
    const result = await neon.query('INSERT INTO messages (message, timestamp) VALUES ($1, NOW()) RETURNING *', [newMessage]);
    res.status(200).json({ success: true, message: 'Data berhasil ditambahkan.', id: result.rows[0].id });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan data.' });
  }
});

// Endpoint untuk membaca pesan
app.get('/read-json', async (req, res) => {
  try {
    const result = await neon.query('SELECT * FROM messages');
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'Gagal membaca data.' });
  }
});

// Endpoint untuk mengunduh data TikTok
app.get('/tikwm/download', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'URL TikTok harus diberikan dalam parameter "url".' });
  }

  try {
    const tikDlData = await tiktokDl(url);
    if (tikDlData) {
      const result = await neon.query('INSERT INTO tikwm_data (url, data, timestamp) VALUES ($1, $2, NOW()) RETURNING *', [url, JSON.stringify(tikDlData)]);
      res.status(200).json({ success: true, data: tikDlData });
    } else {
      res.status(404).json({ error: 'Tidak ada data yang ditemukan untuk URL yang diberikan.' });
    }
  } catch (err) {
    console.error('Kesalahan saat mengunduh data TikTok:', err.message);
    res.status(500).json({ error: 'Terjadi kesalahan internal server.', detail: err.message });
  }
});

// Endpoint untuk membaca data TikTok
app.get('/read-tikwm', async (req, res) => {
  try {
    const result = await neon.query('SELECT * FROM tikwm_data');
    const formattedData = result.rows.map(row => ({
      id: row.id,
      url: row.url,
      data: JSON.parse(row.data),
      timestamp: row.timestamp
    }));
    res.status(200).json({ success: true, data: formattedData });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'Gagal membaca data TikTok.' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
