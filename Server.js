const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { Client } = require('whatsapp-web.js');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io'); 
const path = require('path');
const qrcode = require('qrcode');  // Untuk menghasilkan QR Code

// Setup Express dan HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Menghubungkan socket.io ke server

const port = 4000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));  // Untuk menyajikan HTML dan file statis

// Setup WhatsApp client
const client = new Client();

client.on('qr', (qr) => {
    // Kirim QR Code ke frontend menggunakan socket.io
    qrcode.toDataURL(qr, (err, url) => {
        if (err) {
            console.error("Failed to generate QR code:", err);
            return;
        }
        io.emit('qr', url);
        console.log('QR RECEIVED');
    });
});

client.on('ready', () => {
    io.emit('log', 'WhatsApp is ready!');
    console.log('WhatsApp is ready!');
});

client.initialize();

// Setup Multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + '.csv');
    }
});

const upload = multer({ storage: storage });

// Halaman utama untuk upload CSV dan template pesan
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route untuk menangani upload file CSV dan template pesan
app.post('/upload-csv', upload.single('csvFile'), (req, res) => {
    const { messageTemplates } = req.body;
    const filePath = req.file.path;

    if (!messageTemplates || messageTemplates.length < 3) {
        return res.status(400).send('Template pesan tidak lengkap.');
    }

    console.log('File uploaded:', filePath);
    console.log('Message Templates:', messageTemplates);

    // Lakukan proses pengiriman pesan (menggunakan WhatsApp API atau lainnya)
    // ...

    res.send('File CSV berhasil diproses!');
});

// Menjalankan server
server.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
