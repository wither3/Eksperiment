const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { upload } = require('@vercel/blob/client');

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

    // Upload file ke Blop Storage
    const blob = await upload(tempFilePath, tempFilePath, {
      access: 'public', // Akses publik
    });

    // Kirimkan URL hasil upload ke client
    res.status(200).json({
      success: true,
      message: 'File successfully written and uploaded!',
      blobUrl: blob.url, // URL file di Blop Storage
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
