const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los vehículos con detalles de seguro y asociación
router.get('/', (req, res) => {
    const consulta = `
                      SELECT v.ID, v.PLACAS_ACTUAL, v.N_TARJETA, v.N_MOTOR,
       v.MARCA, v.COLOR, v.ANIO_DE_COMPRA, 
       s.N_POLIZA AS SEGURO, a.nombre AS ASOCIACION
FROM vehiculo v
JOIN seguro_vehicular s ON v.SEGURO_ID = s.ID
JOIN asociaciones a ON v.ASOCIACION_ID = a.id

                    `;

    db.query(consulta, (err, results) => {
        if (err) {
            console.error('Error al obtener los vehículos:', err);
            return res.status(500).json({ error: 'Error al obtener los vehículos' });
        }
        res.json(results);
    });
});

// Agregar un nuevo vehículo
router.post('/', (req, res) => {
    const { PLACAS_ACTUAL, N_TARJETA, N_MOTOR, MARCA, COLOR, ANIO_DE_COMPRA, SEGURO_ID, ASOCIACION_ID } = req.body;

    const consulta = `
        INSERT INTO vehiculo (PLACAS_ACTUAL, N_TARJETA, N_MOTOR, MARCA, COLOR, ANIO_DE_COMPRA, SEGURO_ID, ASOCIACION_ID) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [PLACAS_ACTUAL, N_TARJETA, N_MOTOR, MARCA, COLOR, ANIO_DE_COMPRA, SEGURO_ID, ASOCIACION_ID];

    db.query(consulta, valores, (err, result) => {
        if (err) {
            console.error('Error al agregar el vehículo:', err);
            return res.status(500).json({ error: 'Error al agregar el vehículo' });
        }
        res.status(201).json({ message: 'Vehículo agregado exitosamente', vehiculoId: result.insertId });
    });
});


// Modificar un vehículo existente
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { PLACAS_ACTUAL, N_TARJETA, N_MOTOR, MARCA, COLOR, ANIO_DE_COMPRA, SEGURO_ID, ASOCIACION_ID } = req.body;

    const consulta = `
            UPDATE vehiculo 
            SET PLACAS_ACTUAL = ?, N_TARJETA = ?, N_MOTOR = ?, MARCA = ?, COLOR = ?, ANIO_DE_COMPRA = ?, SEGURO_ID = ?, ASOCIACION_ID = ?
            WHERE ID = ?
        `;

    const valores = [PLACAS_ACTUAL, N_TARJETA, N_MOTOR, MARCA, COLOR, ANIO_DE_COMPRA, SEGURO_ID, ASOCIACION_ID, id];

    db.query(consulta, valores, (err) => {
        if (err) {
            console.error('Error al actualizar el vehículo:', err);
            return res.status(500).json({ error: 'Error al actualizar el vehículo' });
        }
        res.json({ message: 'Vehículo actualizado exitosamente' });
    });
});

// Eliminar un vehículo
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const consulta = 'DELETE FROM vehiculo WHERE ID = ?';

    db.query(consulta, [id], (err) => {
        if (err) {
            console.error('Error al eliminar el vehículo:', err);
            return res.status(500).json({ error: 'Error al eliminar el vehículo' });
        }
        res.json({ message: 'Vehículo eliminado exitosamente' });
    });
});

module.exports = router;
