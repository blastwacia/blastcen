// Backend - app.js
const express = require('express');
const { Client } = require('whatsapp-web.js');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const client = new Client();

client.on('qr', (qr) => {
    io.emit('qr', qr);
    console.log('QR RECEIVED');
});

client.on('ready', () => {
    io.emit('log', 'WhatsApp is ready!');
    console.log('WhatsApp is ready!');
});

client.initialize();

app.use(express.static(path.join(__dirname, 'public'))); // serve static files from 'public' directory

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // serve your HTML file
});

const port = 4000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
