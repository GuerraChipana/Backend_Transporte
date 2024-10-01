const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los seguros vehiculares
router.get('/', (req, res) => {
    const query = 'SELECT id, aseguradora, estado FROM seguro_vehicular';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            return res.status(500).json({ error: 'Error al obtener seguros vehiculares', details: err.message });
        }
        res.json(results);
    });
});

// Agregar un nuevo seguro vehicular
router.post('/', (req, res) => {
    const { aseguradora, id_usuario, fecha_creacion } = req.body;

    if (!aseguradora || !id_usuario) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const query = 'INSERT INTO seguro_vehicular (aseguradora, id_usuario, estado, fecha_registro) VALUES (?, ?, 1, NOW())';
    db.query(query, [aseguradora, id_usuario], (err, result) => {
        if (err) {
            console.error('Error al agregar el seguro vehicular:', err);
            return res.status(500).json({ error: 'Error al agregar el seguro vehicular', details: err.message });
        }
        res.status(201).json({ message: 'Seguro vehicular agregado exitosamente', seguroId: result.insertId });
    });
});

// Actualizar un seguro vehicular
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { aseguradora, id_usuario_modificacion } = req.body;

    // Validar entradas
    if (!aseguradora || !id_usuario_modificacion) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si el seguro vehicular existe
    const checkQuery = 'SELECT * FROM seguro_vehicular WHERE id = ?';
    db.query(checkQuery, [id], (err, results) => {
        if (err) {
            console.error('Error al verificar el seguro vehicular:', err);
            return res.status(500).json({ error: 'Error al verificar seguro vehicular', details: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Seguro vehicular no encontrado' });
        }

        // Actualizar el seguro vehicular
        const query = 'UPDATE seguro_vehicular SET aseguradora = ?, id_usuario_modificacion = ?, fecha_modificacion = NOW() WHERE id = ?';
        db.query(query, [aseguradora, id_usuario_modificacion, id], (err, result) => {
            if (err) {
                console.error('Error al actualizar el seguro vehicular:', err);
                return res.status(500).json({ error: 'Error al actualizar seguro vehicular', details: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Seguro vehicular no encontrado' });
            }

            res.json({ message: 'Seguro vehicular actualizado exitosamente' });
        });
    });
});

// Cambiar el estado de un seguro vehicular
router.patch('/:id/estado', (req, res) => {
    const id = req.params.id;
    const { estado, id_usuario_modificacion } = req.body;

    if (estado === undefined || !id_usuario_modificacion) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const query = 'UPDATE seguro_vehicular SET estado = ?, id_usuario_modificacion = ?, fecha_modificacion = NOW() WHERE id = ?';
    db.query(query, [estado, id_usuario_modificacion, id], (err, result) => {
        if (err) {
            console.error('Error al cambiar el estado del seguro vehicular:', err);
            return res.status(500).json({ error: 'Error al cambiar el estado', details: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Seguro vehicular no encontrado' });
        }

        res.json({ message: 'Estado del seguro vehicular actualizado exitosamente' });
    });
});

module.exports = router;
