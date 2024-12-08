const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json()); // Untuk membaca JSON dari body request

// Lokasi file JSON
const filePath = path.join(__dirname, 'data.json');

// Endpoint untuk menulis teks ke file JSON
app.get('/write-text', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }

    // Baca file jika ada, jika tidak buat file baru
    let data = {};
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      data = JSON.parse(fileContent);
    } catch (err) {
      console.log('File not found, creating a new one...');
    }

    // Tambahkan teks ke file JSON
    data.message = text;

    // Tulis kembali ke file JSON
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    res.status(200).json({ success: true, message: 'Text successfully written to file', data });
  } catch (error) {
    console.error('Error writing to file:', error);
    res.status(500).json({ success: false, message: 'Failed to write text to file', error: error.message });
  }
});

// Endpoint untuk membaca isi file JSON
app.get('/read-json', async (req, res) => {
  try {
    // Baca isi file JSON
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error reading file:', error);

    // Jika file tidak ditemukan
    if (error.code === 'ENOENT') {
      res.status(404).json({ success: false, message: 'File not found' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to read file', error: error.message });
    }
  }
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
