const express = require('express');
const multer = require('multer');
const fs = require('fs');
const csvParser = require('csv-parser');
const { Client } = require('whatsapp-web.js');
const bodyParser = require('body-parser');
const qrcode = require('qrcode');  // Untuk menghasilkan QR Code
const iconv = require('iconv-lite');  // Menangani masalah encoding
const http = require('http');
const socketIo = require('socket.io'); // Menambahkan Socket.io
const path = require('path');

// Setup Express dan HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Menghubungkan socket.io ke server

const port = 4000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Menyajikan file statis (HTML, CSS, JS) dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// Setup WhatsApp client
const client = new Client();

client.on('qr', (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
        if (err) {
            console.error("Failed to generate QR code:", err);
            return;
        }
        // Kirim QR Code ke frontend menggunakan socket.io
        io.emit('qrCode', url);
        console.log('QR RECEIVED');
    });
});

client.on('ready', () => {
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
app.post('/upload', upload.single('contacts'), (req, res) => {
    const filePath = req.file.path;
    const { message1, message2, message3 } = req.body;

    // Validasi pesan
    if (!message1 || !message2 || !message3 || message1.trim() === '' || message2.trim() === '' || message3.trim() === '') {
        return res.status(400).send('Semua pesan template harus diisi.');
    }

    console.log('File uploaded:', filePath);
    console.log('Message Templates:', message1, message2, message3);

    // Baca file CSV untuk kontak
    let contacts = [];
    fs.createReadStream(filePath)
        .pipe(iconv.decodeStream('utf-8'))
        .pipe(csvParser({ skipEmptyLines: true, trim: true }))
        .on('headers', (headers) => {
            const cleanedHeaders = headers.map(header => header.normalize().trim());
            console.log("Headers setelah dibersihkan:", cleanedHeaders);
        })
        .on('data', (row) => {
            const userName = row['USER ID']?.normalize().trim();
            const phoneNumber = row['NO HANDPHONE']?.normalize().trim();

            if (userName && phoneNumber) {
                contacts.push(row);
            }
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            sendMessages(contacts, [message1, message2, message3], res);
        });
});

// Fungsi untuk mengirim pesan ke kontak
async function sendMessages(contacts, messages, res) {
    let sentCount = 0;
    let failedCount = 0;

    for (const contact of contacts) {
        const phoneNumber = contact['NO HANDPHONE'];
        const userName = contact['USER ID'];

        if (phoneNumber && userName) {
            const formattedNumber = phoneNumber.startsWith('+') 
                ? phoneNumber.replace('+', '') 
                : phoneNumber;

            const whatsappNumber = `${formattedNumber}@c.us`;
            
            try {
                const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                const personalizedMessage = randomMessage.replace(/{USER_ID}/g, userName);
                await client.sendMessage(whatsappNumber, personalizedMessage);
                console.log(`Pesan terkirim ke ${userName} (${phoneNumber})`);
                sentCount++;
            } catch (error) {
                console.error(`Gagal mengirim pesan ke ${userName} (${phoneNumber}):`, error);
                failedCount++;
            }

            // Kirim progres pengiriman pesan ke frontend menggunakan socket.io
            io.emit('progress', { sent: sentCount, failed: failedCount });

            // Jeda acak antara 60 hingga 300 detik
            const randomDelay = Math.floor(Math.random() * (300 - 60 + 1)) + 60;
            await new Promise(resolve => setTimeout(resolve, randomDelay * 1000));
        }
    }

    res.send('Pesan berhasil dikirim ke semua kontak.');
}

// Menjalankan server
server.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
