const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors()); // Mengaktifkan CORS

app.get('/write-json', async (req, res) => {
  try {
    // Data yang ingin disimpan
    const data = {
      message: 'Hello, this is a test!',
      timestamp: new Date(),
    };

    // Lokasi penyimpanan sementara
    const tempFilePath = path.join('/tmp', 'data.json');

    // Tulis data ke file sementara
    await fs.writeFile(tempFilePath, JSON.stringify(data, null, 2));

    // Baca konten file
    const fileContent = await fs.readFile(tempFilePath);

    // Kirim file ke Vercel Blob API
    const response = await axios.post(
      'https://api.vercel.com/v2/blob',
      fileContent,
      {
        headers: {
          'Content-Type': 'application/json', // Tipe konten file
          Authorization: `Bearer ${process.env.Hasill}`, // Token API Vercel
        },
      }
    );

    // URL file di Vercel Blob
    const blobUrl = response.data.url;

    // Kirimkan URL hasil upload ke client
    res.status(200).json({
      success: true,
      message: 'File successfully written and uploaded!',
      blobUrl,
    });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({
      success: false,
      message: 'Error writing file.',
      error: error.message,
    });
  }
});

// Jalankan server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
