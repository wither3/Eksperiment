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
      // Membaca file JSON jika sudah ada
      const blob = await get(BLOB_FILE_NAME);
      existingData = JSON.parse(blob.data.toString()); // Parsing isi file JSON
    } catch (err) {
      console.log('File not found, creating a new one.');
    }

    // Tambahkan data baru ke dalam array
    existingData.push({
      message: newMessage,
      timestamp: new Date().toISOString(),
    });

    // Overwrite file yang sama di Blob
    await put(BLOB_FILE_NAME, JSON.stringify(existingData, null, 2), {
      access: 'public',
    });

    res.status(200).json({
      success: true,
      message: 'Data successfully written to the JSON file.',
      fileUrl: `https://your-vercel-storage-url/${BLOB_FILE_NAME}`,
    });
  } catch (error) {
    console.error('Error writing to JSON file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to write JSON file.',
      error: error.message,
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
