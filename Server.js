const express = require('express');
const multer = require('multer');
const { Client } = require('whatsapp-web.js');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Setup Express dan HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Menghubungkan socket.io ke server

const port = 4000;

// Middleware untuk parsing data
app.use(express.static(path.join(__dirname, 'public')));  // Untuk menyajikan file statis seperti HTML

// Setup WhatsApp client
const client = new Client();

client.on('qr', (qr) => {
    // Kirim QR Code ke frontend menggunakan socket.io
    io.emit('qr', qr);
    console.log('QR RECEIVED');
});

client.on('ready', () => {
    io.emit('log', 'WhatsApp is ready!');
    console.log('WhatsApp is ready!');
});

client.initialize();

// Halaman utama untuk upload CSV dan template pesan
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Memastikan file HTML dikelola oleh server
});

// Mulai server
server.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
