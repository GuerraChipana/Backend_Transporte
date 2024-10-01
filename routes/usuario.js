const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los usuarios
router.get('/', (req, res) => {
    const query = `SELECT id, dni, nombre, apellido, usuario, estado FROM usuario`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.json(results);
    });
});

// Agregar un nuevo usuario
router.post('/', (req, res) => {
    const { dni, nombre, apellido, usuario, contrasena } = req.body;

    if (!dni || !nombre || !apellido || !usuario || !contrasena) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const query = `INSERT INTO usuario (dni, nombre, apellido, usuario, contrasena, estado, fecha_registro) VALUES (?, ?, ?, ?, ?, 1, NOW())`;
    db.query(query, [dni, nombre, apellido, usuario, contrasena], (err, result) => {
        if (err) {
            console.error('Error al agregar el usuario:', err);
            return res.status(500).json({ error: 'Error al agregar el usuario' });
        }
        res.status(201).json({ message: 'Usuario agregado exitosamente', usuarioId: result.insertId });
    });
});

// Actualizar un usuario
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { dni, nombre, apellido, usuario, contrasena, estado } = req.body;

    if (!dni || !nombre || !apellido || !usuario || estado === undefined) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const query = `UPDATE usuario SET dni = ?, nombre = ?, apellido = ?, usuario = ?, contrasena = ?, estado = ? WHERE id = ?`;
    db.query(query, [dni, nombre, apellido, usuario, contrasena, estado, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el usuario:', err);
            return res.status(500).json({ error: 'Error al actualizar usuario' });
        }
        res.json({ message: 'Usuario actualizado exitosamente' });
    });
});

// Cambiar el estado de un usuario
router.patch('/:id/estado', (req, res) => {
    const id = req.params.id;
    const { estado } = req.body;

    if (estado === undefined) {
        return res.status(400).json({ error: 'El estado es requerido' });
    }

    const query = `UPDATE usuario SET estado = ? WHERE id = ?`;
    db.query(query, [estado, id], (err, result) => {
        if (err) {
            console.error('Error al cambiar el estado del usuario:', err);
            return res.status(500).json({ error: 'Error al cambiar el estado' });
        }
        res.json({ message: 'Estado del usuario actualizado exitosamente' });
    });
});

module.exports = router;
