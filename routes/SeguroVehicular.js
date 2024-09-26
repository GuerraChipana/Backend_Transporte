const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los seguros vehiculares
router.get('/', (req, res) => {
    const query = `SELECT id, aseguradora, n_poliza, vigencia FROM seguro_vehicular`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener seguros vehiculares:', err);
            return res.status(500).json({ error: 'Error al obtener seguros vehiculares' });
        }
        res.json(results);
    });
});

// Agregar un nuevo seguro vehicular
router.post('/', (req, res) => {
    const { aseguradora, n_poliza, vigencia } = req.body;

    if (!aseguradora || !n_poliza || !vigencia) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const query = `INSERT INTO seguro_vehicular (aseguradora, n_poliza, vigencia) VALUES (?, ?, ?)`;
    db.query(query, [aseguradora, n_poliza, vigencia], (err, result) => {
        if (err) {
            console.error('Error al agregar el seguro vehicular:', err);
            return res.status(500).json({ error: 'Error al agregar el seguro vehicular' });
        }
        res.status(201).json({ message: 'Seguro vehicular agregado exitosamente', seguroId: result.insertId });
    });
});

// Actualizar un seguro vehicular
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { aseguradora, n_poliza, vigencia } = req.body;

    if (!aseguradora || !n_poliza || !vigencia) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const query = `UPDATE seguro_vehicular SET aseguradora = ?, n_poliza = ?, vigencia = ? WHERE id = ?`;
    db.query(query, [aseguradora, n_poliza, vigencia, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el seguro vehicular:', err);
            return res.status(500).json({ error: 'Error al actualizar seguro vehicular' });
        }
        res.json({ message: 'Seguro vehicular actualizado exitosamente' });
    });
});

// Eliminar un seguro vehicular
router.delete('/:id', (req, res) => {
    const id = req.params.id;

    const query = 'DELETE FROM seguro_vehicular WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el seguro vehicular:', err);
            return res.status(500).json({ error: 'Error al eliminar seguro vehicular' });
        }
        res.json({ message: 'Seguro vehicular eliminado exitosamente' });
    });
});

module.exports = router;
