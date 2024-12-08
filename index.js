const express = require('express');
const cors = require('cors');
const { get, put } = require('@vercel/blob');

const app = express();
app.use(cors());
app.use(express.json());

const BLOB_FILE_NAME = 'datanya-FBoocHcPmdUatm6T0rOsj7LAXr079N.json';

app.get('/write-json', async (req, res) => {
  try {
    const newMessage = req.query.req;

    if (!newMessage) {
      return res.status(400).json({ success: false, message: 'Parameter "req" is required' });
    }

    let existingData = [];
    try {
      // Baca file JSON dari Blob
      const blob = await get(BLOB_FILE_NAME);
      existingData = JSON.parse(blob.data.toString()); // Parsing data lama
    } catch (err) {
      console.log('File not found, creating a new one.');
    }

    // Tambahkan data baru
    existingData.push({
      message: newMessage,
      timestamp: new Date().toISOString(),
    });

    // Tulis data kembali ke file JSON yang sama
    await put(BLOB_FILE_NAME, JSON.stringify(existingData, null, 2), {
      access: 'public', // Pastikan file dapat diakses
    });

    // Kirim respons sukses
    res.status(200).json({
      success: true,
      message: 'Data successfully updated in the JSON file.',
      fileUrl: `https://vercel-storage-name.vercel.app/${BLOB_FILE_NAME}`,
    });
  } catch (error) {
    console.error('Error writing to JSON file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update JSON file.',
      error: error.message,
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
