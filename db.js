const mysql = require('mysql2');

// Bikin koneksi
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mylab'
});

// Connect ke database
connection.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Export supaya bisa dipakai di file lain
module.exports = connection;
