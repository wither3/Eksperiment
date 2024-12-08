const express = require('express');
const cors = require('cors');
const { put } = require('@vercel/blob');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/write-json', async (req, res) => {
  try {
    // Ambil teks dari request body
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }

    // Data yang akan disimpan di file JSON
    const data = {
      message: text,
      timestamp: new Date().toISOString(),
    };

    // Upload data JSON ke Vercel Blob
    const blob = await put('data.json', JSON.stringify(data, null, 2), {
      access: 'public', // Buat file ini dapat diakses secara publik
    });

    res.status(200).json({
      success: true,
      message: 'Text successfully written to Vercel Blob',
      blobUrl: blob.url, // URL file yang tersimpan
    });
  } catch (error) {
    console.error('Error writing to Vercel Blob:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to write text to Vercel Blob',
      error: error.message,
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
