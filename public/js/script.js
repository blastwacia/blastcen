// /public/script.js
var socket = io();

// Mendengarkan event 'qrCode' dan menampilkan QR Code di frontend
socket.on('qrCode', function(url) {
    document.getElementById('qrCodeImage').innerHTML = `<img src="${url}" alt="QR Code" class="img-fluid">`;
});

// Mendengarkan progres pengiriman pesan
socket.on('progress', function(data) {
    document.getElementById('sentCount').textContent = data.sent;
    document.getElementById('failedCount').textContent = data.failed;

    var progressBar = document.getElementById('progressBar');
    var progress = (data.sent / (data.sent + data.failed)) * 100;
    progressBar.style.width = progress + '%';
});

document.getElementById('blastForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var formData = new FormData(this);

    // Kirim form data ke server untuk diproses
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        alert('Pesan berhasil dikirim');
    })
    .catch(error => {
        console.error('Terjadi kesalahan:', error);
    });
});
