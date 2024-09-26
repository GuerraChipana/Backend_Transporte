const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mdtai_transporte_2'
});

db.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos:', err);
        throw err;
    }
    console.log('Conectado a la base de datos.');
});

module.exports = db;
