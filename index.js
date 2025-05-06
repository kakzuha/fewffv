const express = require('express');
const db = require('./db'); // koneksi database
const app = express();
const PORT = 3000;

// Endpoint untuk halaman utama
app.get('/', (req, res) => {
  const kodeRuangan = 'RTF.III.3'; // Bisa kamu dinamis nanti kalau mau

  // Query untuk ambil kegiatan yang berlangsung sekarang
  const ongoingQuery = `
    SELECT *,
      CASE
        WHEN jenis_kegiatan = 'lainnya' THEN nama_kegiatan_other
        ELSE jenis_kegiatan
      END AS kegiatan
    FROM api
    WHERE tanggal_pinjam = CURDATE()
      AND kode_ruangan = ?
      AND CURTIME() BETWEEN start_time AND end_time
    ORDER BY start_time ASC
    LIMIT 1
  `;

  // Query untuk ambil kegiatan berikutnya
  const nextQuery = `
    SELECT *,
      CASE
        WHEN jenis_kegiatan = 'lainnya' THEN nama_kegiatan_other
        ELSE jenis_kegiatan
      END AS kegiatan
    FROM api
    WHERE tanggal_pinjam = CURDATE()
      AND kode_ruangan = ?
      AND start_time > CURTIME()
    ORDER BY start_time ASC
    LIMIT 1
  `;

  db.query(ongoingQuery, [kodeRuangan], (err, ongoingResult) => {
    if (err) {
      return res.send('Error retrieving ongoing data!');
    }

    db.query(nextQuery, [kodeRuangan], (err, nextResult) => {
      if (err) {
        return res.send('Error retrieving next schedule data!');
      }

      // HTML Building
      let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>MyLab Schedule</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            .bg-custom-blue { background-color: #295292; color: white; }
            .bg-deep-blue { background-color: #0b1d35; color: white; }
            .divider { border-bottom: 2px solid #ffffff; margin: 1rem 0; }
            .vertical-divider { border-left: 2px solid #ffffff; height: auto; margin: 0 10px; }
            .mb-6 { margin-bottom: 6rem; }
          </style>
        </head>
        <body class="p-4">
          <div class="container">
            <div class="row g-3">
              <div class="col-12 col-md-9 p-4 bg-custom-blue">
                <div class="d-flex justify-content-end">
                  <div class="text-end">
                    <p><i id="tanggal"></i></p>
                    <p><b id="jam"></b></p>
                  </div>
                </div>

                <script>
                  function updateDateTime() {
                    const now = new Date();
                    const options = { year: 'numeric', month: 'long', day: 'numeric' };
                    const currentDate = now.toLocaleDateString('id-ID', options);
                    document.getElementById('tanggal').innerHTML = currentDate;
                    let hours = now.getHours();
                    let minutes = now.getMinutes();
                    let seconds = now.getSeconds();
                    hours = hours < 10 ? '0' + hours : hours;
                    minutes = minutes < 10 ? '0' + minutes : minutes;
                    seconds = seconds < 10 ? '0' + seconds : seconds;
                    const currentTime = \`\${hours}:\${minutes}:\${seconds}\`;
                    document.getElementById('jam').innerHTML = currentTime;
                  }
                  setInterval(updateDateTime, 1000);
                  updateDateTime();
                </script>

                <h3>${kodeRuangan}</h3>
                <div class="divider"></div>
                <h1>${ongoingResult.length > 0 ? 'Berlangsung' : 'Tidak ada peminjaman'}</h1>

                <div class="my-5"></div>
      `;

      if (ongoingResult.length > 0) {
        const ongoing = ongoingResult[0];
        html += `
          <article>
            <h6>${ongoing.start_time} - ${ongoing.end_time} WIB</h6>
            <div class="d-flex align-items-stretch gap-3 mt-3">
              <div><h4 class="m-0"><span class="d-block">${ongoing.kegiatan}</span></h4></div>
              <div class="vertical-divider"></div>
              <div><h4 class="m-0">${ongoing.nama_mahasiswa}</h4></div>
              <div class="vertical-divider"></div>
              <div><h4 class="m-0">${ongoing.nama_penanggungjawab}</h4></div>
            </div>
          </article>
        `;
      }

      html += `
              </div>

              <div class="col-12 col-md-3 p-4 bg-deep-blue">
                <div class="mb-6"></div>
                <p>Jadwal Berikutnya</p>
      `;

      if (nextResult.length > 0) {
        const next = nextResult[0];
        html += `
          <h6>${next.start_time} - ${next.end_time} WIB</h6>
          <div class="d-flex align-items-stretch gap-3 mt-2">
            <div><h4 class="m-0">${next.kegiatan}</h4></div>
            <div class="vertical-divider"></div>
            <div><h4 class="m-0">${next.nama_mahasiswa}</h4></div>
          </div>
        `;
      } else {
        html += `
          <h6>-</h6>
          <h4 class="mt-2">Tidak ada peminjaman</h4>
        `;
      }

      html += `
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      res.send(html);
    });
  });
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
  
