const express = require('express');
const cors = require('cors'); // Import cors
const { tiktokDl } = require('./tikwm2.js'); // Import tiktokDl
const { Upstash } = require('@upstash/redis'); // Import Upstash

const app = express();
const upstash = new Upstash({
  url: 'rediss://default:AYGRAAIjcDEyZDFlZTY3OWUyMzM0MDcyOTNiYmM0MDRmMWVlZWE4MXAxMA@summary-goshawk-33169.upstash.io', // Ganti dengan URL Upstash Anda
  token: 'AYGRAAIjcDEyZDFlZTY3OWUyMzM0MDcyOTNiYmM0MDRmMWVlZWE4MXAxMA' // Ganti dengan token Upstash Anda
});

// Gunakan middleware CORS
app.use(cors());
app.use(express.json()); // Middleware untuk parsing JSON

// Endpoint untuk menulis data ke Upstash
app.post('/write-json', async (req, res) => {
  const newMessage = req.body.message;
  if (!newMessage) {
    return res.status(400).json({ success: false, message: 'Parameter "message" is required' });
  }

  const timestamp = new Date().toISOString();
  try {
    await upstash.set(`message:${timestamp}`, JSON.stringify({ message: newMessage, timestamp }));
    res.status(200).json({ success: true, message: 'Data berhasil ditambahkan.' });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan data.' });
  }
});

// Endpoint untuk membaca data dari Upstash
app.get('/read-json', async (req, res) => {
  try {
    const keys = await upstash.keys('message:*');
    const messages = await Promise.all(keys.map(async key => {
      const messageData = await upstash.get(key);
      return JSON.parse(messageData);
    }));
    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ success: false, message: 'Gagal membaca data.' });
  }
});

// Endpoint untuk mengunduh data TikTok dan menyimpannya ke Upstash
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
      const timestamp = new Date().toISOString();
      await upstash.set(`tikwm_data:${timestamp}`, JSON.stringify({ url, data: tikDlData, timestamp }));
      return res.status(200).json({ success: true, data: tikDlData });
    } else {
      return res.status(404).json({ error: 'Tidak ada data yang ditemukan untuk URL yang diberikan.' });
    }
  } catch (error) {
    console.error('Kesalahan saat mengunduh data TikTok:', error.message);
    return res.status(500).json({ error: 'Terjadi kesalahan internal server.', detail: error.message });
  }
});

// Endpoint untuk membaca data TikTok yang telah disimpan
app.get('/read-tikwm', async (req, res) => {
  try {
    const keys = await upstash.keys('tikwm_data:*');
    const tikwmData = await Promise.all(keys.map(async key => {
      const data = await upstash.get(key);
      return JSON.parse(data);
    }));
    res.status(200).json({ success: true, data: tikwmData });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ success: false, message: 'Gagal membaca data TikTok.' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
