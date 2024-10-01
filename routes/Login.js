const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
    const { usuario, contrasena } = req.body;
    console.log('Usuario recibido:', usuario);
    console.log('Contraseña recibida:', contrasena);

    const query = 'SELECT * FROM usuario WHERE usuario = ? AND contrasena = ? AND ESTADO = 1';

    db.query(query, [usuario, contrasena], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ success: false, message: 'Error en el servidor.', error: err });
        }

        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.json({ success: false, message: 'Credenciales incorrectas o usuario inactivo.' });
        }
    });
});


module.exports = router;