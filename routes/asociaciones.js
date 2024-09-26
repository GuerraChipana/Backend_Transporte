const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todas las asociaciones
router.get('/', (req, res) => {
    console.log('Solicitud a /api/asociaciones recibida');
    db.query('SELECT * FROM Asociaciones', (err, results) => {
        if (err) {
            console.error('Error al obtener asociaciones:', err);
            return res.status(500).json({ error: 'Error al obtener asociaciones' });
        }
        console.log('Asociaciones obtenidas:', results);
        res.json(results);
    });
});

// Agregar una nueva asociación
router.post('/', (req, res) => {
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: 'El nombre de la asociación es obligatorio' });
    }

    const consulta = `INSERT INTO Asociaciones (nombre) VALUES (?)`;

    db.query(consulta, [nombre], (err, resultado) => {
        if (err) {
            console.error('Error al agregar la asociación:', err);
            return res.status(500).json({ error: 'Error al agregar la asociación' });
        }
        res.json({ message: 'Asociación agregada con éxito', id: resultado.insertId });
    });
});

// Actualizar una asociación existente
router.put('/:id', (req, res) => {
    const asociacionId = req.params.id;
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: 'El nombre de la asociación es obligatorio' });
    }

    const consulta = 'UPDATE Asociaciones SET nombre = ? WHERE id = ?';

    db.query(consulta, [nombre, asociacionId], (err, resultado) => {
        if (err) {
            console.error('Error al actualizar la asociación:', err);
            return res.status(500).json({ error: 'Error al actualizar la asociación' });
        }
        res.json({ message: 'Asociación actualizada exitosamente' });
    });
});

// Eliminar una asociación existente
router.delete('/:id', (req, res) => {
    const asociacionId = req.params.id;

    const consulta = 'DELETE FROM Asociaciones WHERE id = ?';

    db.query(consulta, [asociacionId], (err, resultado) => {
        if (err) {
            console.error('Error al eliminar la asociación:', err);
            return res.status(500).json({ error: 'Error al eliminar la asociación' });
        }
        res.json({ message: 'Asociación eliminada exitosamente' });
    });
});

module.exports = router;
