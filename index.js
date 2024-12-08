const express = require('express');
const cors = require('cors');
const { get, put, del } = require('@vercel/blob');

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
      // Membaca file JSON yang sudah ada
      const blob = await get(BLOB_FILE_NAME);
      existingData = JSON.parse(blob.data.toString());
    } catch (err) {
      console.log('File tidak ditemukan. Membuat file baru...');
    }

    // Menambahkan data baru ke file JSON
    existingData.push({
      message: newMessage,
      timestamp: new Date().toISOString(),
    });

    // Hapus file lama sebelum menimpa
    try {
      await del(BLOB_FILE_NAME); // Menghapus file lama
    } catch (err) {
      console.log('Tidak ada file lama untuk dihapus.');
    }

    // Menulis ulang file yang sama dengan data terbaru
    await put(BLOB_FILE_NAME, JSON.stringify(existingData, null, 2), {
      access: 'public',
    });

    res.status(200).json({
      success: true,
      message: 'Data berhasil ditulis ke file JSON.',
      fileUrl: `https://your-vercel-storage-url/${BLOB_FILE_NAME}`,
    });
  } catch (error) {
    console.error('Error saat menulis ke file JSON:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menulis ke file JSON.',
      error: error.message,
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
