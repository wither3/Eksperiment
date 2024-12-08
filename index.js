const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors()); // Mengaktifkan CORS

app.get('/write-json', async (req, res) => {
  try {
    // Data yang ingin disimpan
    const data = {
      message: 'Hello, this is a test!',
      timestamp: new Date(),
    };

    // Lokasi penyimpanan sementara (hanya untuk fungsi serverless, gunakan /tmp)
    const filePath = path.join('/tmp', 'data.json');

    // Tulis data ke file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    // Kirimkan respon ke client
    res.status(200).json({
      success: true,
      message: 'File successfully written!',
      filePath,
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
