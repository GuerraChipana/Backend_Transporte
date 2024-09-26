const express = require('express');
const router = express.Router();
const db = require('../db');

// Buscar propietarios por DNI
router.get('/search', async (req, res) => {
    const { dni } = req.query;

    try {
        const query = dni ? `SELECT * FROM propietarios WHERE dni LIKE ?` : `SELECT * FROM propietarios`;
        const values = dni ? [`%${dni}%`] : [];
        const [results] = await db.execute(query, values);
        res.json(results);
    } catch (error) {
        console.error('Error al buscar propietarios:', error);
        res.status(500).send('Error al buscar propietarios');
    }
});

// Obtener todos los propietarios
router.get('/', (req, res) => {
    const query = `SELECT id, nombre, apellido, dni, telefono, domicilio FROM Propietario`;
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
    const { nombre, apellido, dni, telefono, domicilio } = req.body;

    if (!nombre || !apellido || !dni || !telefono || !domicilio) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const query = `INSERT INTO Propietario (nombre, apellido, dni, telefono, domicilio) VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [nombre, apellido, dni, telefono, domicilio], (err, result) => {
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
    const { nombre, apellido, dni, telefono, domicilio } = req.body;

    if (!nombre || !apellido || !dni || !telefono || !domicilio) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const query = `UPDATE Propietario SET nombre = ?, apellido = ?, dni = ?, telefono = ?, domicilio = ? WHERE id = ?`;
    db.query(query, [nombre, apellido, dni, telefono, domicilio, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el propietario:', err);
            return res.status(500).json({ error: 'Error al actualizar propietario' });
        }
        res.json({ message: 'Propietario actualizado exitosamente' });
    });
});

// Eliminar un propietario
router.delete('/:id', (req, res) => {
    const id = req.params.id;

    const query = 'DELETE FROM Propietario WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el propietario:', err);
            return res.status(500).json({ error: 'Error al eliminar propietario' });
        }
        res.json({ message: 'Propietario eliminado exitosamente' });
    });
});

module.exports = router;
