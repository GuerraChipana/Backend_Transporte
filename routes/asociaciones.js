const express = require('express');
const router = express.Router();
const db = require('../db'); // Asegúrate de que 'db' esté configurado correctamente para conectarse a la base de datos.

// Obtener todas las asociaciones
router.get('/', (req, res) => {
    const query = 'SELECT * FROM asociaciones';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener las asociaciones:', err);
            return res.status(500).json({ error: 'Error al obtener asociaciones', details: err.message });
        }
        res.status(200).json(results);
    });
});

// Agregar una nueva asociación
router.post('/', (req, res) => {
    const { nombre, id_usuario } = req.body;
    
    console.log('Datos recibidos en la solicitud POST:', { nombre, id_usuario });

    // Validar entradas
    if (!nombre || !id_usuario) {
        console.error('Faltan campos requeridos');
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const query = 'INSERT INTO asociaciones (nombre, id_usuario, estado, fecha_registro) VALUES (?, ?, 1, NOW())';
    db.query(query, [nombre, id_usuario], (err, result) => {
        if (err) {
            console.error('Error al agregar la asociación:', err);
            return res.status(500).json({ error: 'Error al agregar la asociación', details: err.message });
        }
        console.log('Asociación agregada exitosamente:', result);
        res.status(201).json({ message: 'Asociación agregada exitosamente', asociacionId: result.insertId });
    });
});


// Actualizar una asociación
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, id_usuario_modificacion } = req.body;

    // Validar entradas
    if (!nombre || !id_usuario_modificacion) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si la asociación existe primero
    const checkQuery = 'SELECT * FROM asociaciones WHERE id = ?';
    db.query(checkQuery, [id], (err, results) => {
        if (err) {
            console.error('Error al verificar la asociación:', err);
            return res.status(500).json({ error: 'Error al verificar asociación', details: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Asociación no encontrada' });
        }

        // Ahora proceder a la actualización
        const query = 'UPDATE asociaciones SET nombre = ?, id_usuario_modificacion = ?, fecha_modificacion = NOW() WHERE id = ?';
        db.query(query, [nombre, id_usuario_modificacion, id], (err, result) => {
            if (err) {
                console.error('Error al actualizar la asociación:', err);
                return res.status(500).json({ error: 'Error al actualizar asociación', details: err.message });
            }

            res.json({ message: 'Asociación actualizada exitosamente' });
        });
    });
});



// Cambiar el estado de una asociación
router.patch('/:id/estado', (req, res) => {
    const id = req.params.id;
    const { estado, id_usuario_modificacion } = req.body;

    // Validar entradas
    if (estado === undefined || !id_usuario_modificacion) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const query = 'UPDATE asociaciones SET estado = ?, id_usuario_modificacion = ?, fecha_modificacion = NOW() WHERE id = ?';
    db.query(query, [estado, id_usuario_modificacion, id], (err, result) => {
        if (err) {
            console.error('Error al cambiar el estado de la asociación:', err);
            return res.status(500).json({ error: 'Error al cambiar el estado', details: err.message });
        }

        // Verificar si se actualizó algo
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Asociación no encontrada' });
        }

        res.json({ message: 'Estado de la asociación actualizado exitosamente' });
    });
});

module.exports = router;
