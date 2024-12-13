// Frontend (browser-side)
window.addEventListener('load', function () {
    const qrCodeCanvas = document.getElementById('qrCodeCanvas');
    const qrStatus = document.getElementById('qrStatus');

    // Generate QR code here using QRCode.js
    QRCode.toCanvas(qrCodeCanvas, 'Your QR Code Data', function (error) {
        if (error) {
            console.error('Error generating QR Code:', error);
            qrStatus.textContent = 'Failed to generate QR Code.';
        } else {
            qrStatus.textContent = 'Scan QR Code to log in.';
        }
    });
});

// Save Template
document.getElementById('saveTemplate').addEventListener('click', function() {
    const template = document.getElementById('messageTemplate').value;
    if (template) {
        localStorage.setItem('messageTemplate', template);
        alert('Template berhasil disimpan!');
    } else {
        alert('Template pesan tidak boleh kosong.');
    }
});

// Save Time Range
document.getElementById('saveTime').addEventListener('click', function() {
    const minDelay = document.getElementById('minDelay').value;
    const maxDelay = document.getElementById('maxDelay').value;
    if (minDelay && maxDelay && parseInt(minDelay) <= parseInt(maxDelay)) {
        localStorage.setItem('timeRange', JSON.stringify({ min: minDelay, max: maxDelay }));
        alert('Rentang waktu pengiriman berhasil disimpan!');
    } else {
        alert('Masukkan rentang waktu yang valid.');
    }
});

// Save Break Time
document.getElementById('saveBreakTime').addEventListener('click', function() {
    const breakTime = document.getElementById('breakTime').value;
    if (breakTime) {
        localStorage.setItem('breakTime', breakTime);
        alert('Jeda istirahat berhasil disimpan!');
    } else {
        alert('Jeda istirahat tidak boleh kosong.');
    }
});

// Progress Simulation
let sentMessages = 0;
let failedMessages = 0;
let totalMessages = 100;

document.getElementById('startButton').addEventListener('click', function() {
    const interval = setInterval(function() {
        sentMessages++;
        const progress = Math.round((sentMessages / totalMessages) * 100);
        document.getElementById('progressBar').style.width = progress + '%';
        document.getElementById('progressBar').textContent = progress + '%';
        document.getElementById('progressText').textContent = `Pesan terkirim: ${sentMessages} | Pesan gagal: ${failedMessages}`;

        if (sentMessages >= totalMessages) {
            clearInterval(interval);
            alert('Pengiriman selesai!');
        }
    }, 1000);
});

document.getElementById('stopButton').addEventListener('click', function() {
    alert('Proses dihentikan.');
});

document.getElementById('resetButton').addEventListener('click', function() {
    sentMessages = 0;
    failedMessages = 0;
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('progressBar').textContent = '0%';
    document.getElementById('progressText').textContent = `Pesan terkirim: 0 | Pesan gagal: 0`;
    alert('Pengaturan direset.');
});
