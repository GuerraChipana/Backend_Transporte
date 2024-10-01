const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los propietarios
router.get('/', (req, res) => {
    const query = `SELECT id, nombre, apellido, dni, telefono, domicilio, estado FROM Propietario`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener propietarios:', err);
            return res.status(500).json({ error: 'Error al obtener propietarios' });
        }
        res.json(results);
    });
});

// Agregar un nuevo propietario
router.post('/', (req, res) => {
    const { nombre, apellido, dni, telefono, domicilio, idUsuario } = req.body;

    if (!nombre || !apellido || !dni || !telefono || !domicilio || idUsuario === undefined) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const query = `INSERT INTO Propietario (ID_USUARIO, nombre, apellido, dni, telefono, domicilio, FECHA_REGISTRO) VALUES (?, ?, ?, ?, ?, ?, NOW())`;
    db.query(query, [idUsuario, nombre, apellido, dni, telefono, domicilio], (err, result) => {
        if (err) {
            console.error('Error al agregar el propietario:', err);
            return res.status(500).json({ error: 'Error al agregar el propietario' });
        }
        res.status(201).json({ message: 'Propietario agregado exitosamente', propietarioId: result.insertId });
    });
});

// Actualizar un propietario
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, apellido, dni, telefono, domicilio, estado } = req.body;

    if (!nombre || !apellido || !dni || !telefono || !domicilio || estado === undefined) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const query = `UPDATE Propietario SET nombre = ?, apellido = ?, dni = ?, telefono = ?, domicilio = ?, estado = ? WHERE id = ?`;
    db.query(query, [nombre, apellido, dni, telefono, domicilio, estado, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el propietario:', err);
            return res.status(500).json({ error: 'Error al actualizar propietario' });
        }
        res.json({ message: 'Propietario actualizado exitosamente' });
    });
});

// Cambiar el estado de un propietario
router.patch('/:id/estado', (req, res) => {
    const id = req.params.id;
    const { estado } = req.body;

    if (estado === undefined) {
        return res.status(400).json({ error: 'El estado es requerido' });
    }

    const query = `UPDATE Propietario SET estado = ? WHERE id = ?`;
    db.query(query, [estado, id], (err, result) => {
        if (err) {
            console.error('Error al cambiar el estado del propietario:', err);
            return res.status(500).json({ error: 'Error al cambiar el estado' });
        }
        res.json({ message: 'Estado del propietario actualizado exitosamente' });
    });
});

module.exports = router;
