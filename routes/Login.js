const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
    const { name, password } = req.body;

    const query = 'SELECT * FROM administrador WHERE USUARIO = ? AND CONTRASENA = ?';
    db.query(query, [name, password], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ success: false, message: 'Error en el servidor.' });
        }

        if (results.length > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Credenciales incorrectas.' });
        }
    });
});

module.exports = router;
