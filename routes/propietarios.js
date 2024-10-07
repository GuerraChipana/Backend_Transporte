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
    const { nombre, apellido, dni, telefono, domicilio, id_usuario } = req.body;
    console.log('Datos recibidos en la solicitud POST:', { nombre, apellido, dni, telefono, domicilio, id_usuario });

    if (!nombre || !apellido || !dni || !id_usuario) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const query = `INSERT INTO Propietario (ID_USUARIO, nombre, apellido, dni, telefono, domicilio, FECHA_REGISTRO) VALUES (?, ?, ?, ?, ?, ?, NOW())`;
    db.query(query, [id_usuario, nombre, apellido, dni, telefono, domicilio], (err, result) => {
        if (err) {
            console.error('Error al agregar el propietario:', err);
            return res.status(500).json({ error: 'Error al agregar el propietario', details: err.message });
        }
        res.status(201).json({ message: 'Propietario agregado exitosamente', propietarioId: result.insertId });
    });
});

// Actualizar un propietario
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, apellido, dni, telefono, domicilio, id_usuario_modificacion } = req.body;

    // Validar entradas
    if (!nombre || !apellido || !dni || !id_usuario_modificacion) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si el propietario existe
    const checkQuery = 'SELECT * FROM Propietario WHERE id = ?';
    db.query(checkQuery, [id], (err, results) => {
        if (err) {
            console.error('Error al verificar el propietario:', err);
            return res.status(500).json({ error: 'Error al verificar propietario', details: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Propietario no encontrado' });
        }

        // Actualizar el propietario
        const query = 'UPDATE Propietario SET nombre = ?, apellido = ?, dni = ?, telefono = ?, domicilio = ?, id_usuario_modificacion = ?, fecha_modificacion = NOW() WHERE id = ?';
        db.query(query, [nombre, apellido, dni, telefono, domicilio, id_usuario_modificacion, id], (err, result) => {
            if (err) {
                console.error('Error al actualizar el propietario:', err);
                return res.status(500).json({ error: 'Error al actualizar propietario', details: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Propietario no encontrado' });
            }

            res.json({ message: 'Propietario actualizado exitosamente' });
        });
    });
});

// Cambiar el estado de un propietario
router.patch('/:id/estado', (req, res) => {
    const id = req.params.id;
    const { estado, id_usuario_modificacion } = req.body;

    if (estado === undefined || !id_usuario_modificacion) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const query = `UPDATE Propietario SET estado = ?, id_usuario_modificacion = ?, fecha_modificacion = NOW() WHERE id = ?`;
    db.query(query, [estado, id_usuario_modificacion, id], (err, result) => {
        if (err) {
            console.error('Error al cambiar el estado del propietario:', err);
            return res.status(500).json({ error: 'Error al cambiar el estado', details: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Seguro vehicular no encontrado' });
        }

        res.json({ message: 'Estado del propietario actualizado exitosamente' });
    });
});

module.exports = router;
