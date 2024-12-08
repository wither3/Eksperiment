const express = require('express');
const cors = require('cors');
const { get, put } = require('@vercel/blob');

const app = express();
app.use(cors());
app.use(express.json());

const BLOB_FILE_NAME = 'datanya-ElUkelUGMtvaBsM1xWKo6Sp3aG1sDt.json';

app.get('/write-json', async (req, res) => {
  try {
    const newMessage = req.query.req;

    if (!newMessage) {
      return res.status(400).json({ success: false, message: 'Text parameter is required' });
    }

    // Ambil data lama dari file JSON di Vercel Blob
    let existingData = [];
    try {
      const blob = await get(BLOB_FILE_NAME);
      existingData = JSON.parse(blob.data.toString()); // Parsing data lama
    } catch (err) {
      console.log('File not found or empty, creating a new one.');
    }

    // Tambahkan data baru ke array
    existingData.push({
      message: newMessage,
      timestamp: new Date().toISOString(),
    });

    // Simpan data baru ke file JSON di Vercel Blob
    const updatedBlob = await put(BLOB_FILE_NAME, JSON.stringify(existingData, null, 2), {
      access: 'public',
    });

    // Kirimkan URL file JSON kepada client
    res.status(200).json({
      success: true,
      message: 'File successfully updated',
      blobUrl: updatedBlob.url, // URL file JSON
    });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update file',
      error: error.message,
    });
  }
});

// Jalankan server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
