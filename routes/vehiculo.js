const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener datos de los vehículos
router.get('/', (req, res) => {
    const consulta = `CALL SP_V_DatosVehiculo()`;

    db.query(consulta, (err, results) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            return res.status(500).json({ error: 'Error al obtener datos de los vehículos', details: err.message });
        }
        res.json({ message: 'Datos obtenidos con éxito', data: results[0] });
    });
});

// Agregar un nuevo vehículo
router.post('/', (req, res) => {
    const { PLACA, N_TARJETA, N_MOTOR, MARCA,
        COLOR, ANO_DE_COMPRA, SEGURO_ID, ASOCIACION_ID,
        N_POLIZA, FECHA_VIGENCIA_DESDE, FECHA_VIGENCIA_HASTA,
        PROPIETARIO_1_ID, PROPIETARIO_2_ID, ID_USUARIO } = req.body;

    // Validar los campos obligatorios
    if (!PLACA || !N_TARJETA || !N_MOTOR || !MARCA ||
        !COLOR || !ANO_DE_COMPRA || !SEGURO_ID || !ASOCIACION_ID ||
        !N_POLIZA || !FECHA_VIGENCIA_DESDE || !FECHA_VIGENCIA_HASTA ||
        !PROPIETARIO_1_ID || !PROPIETARIO_2_ID || !ID_USUARIO) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const consulta = `
        CALL SP_V_AgregarVehiculo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        PLACA, N_TARJETA, N_MOTOR, MARCA, COLOR,
        ANO_DE_COMPRA, SEGURO_ID, ASOCIACION_ID,
        N_POLIZA, FECHA_VIGENCIA_DESDE, FECHA_VIGENCIA_HASTA,
        PROPIETARIO_1_ID, PROPIETARIO_2_ID, ID_USUARIO
    ];

    db.query(consulta, valores, (err, result) => {
        if (err) {
            console.error('Error al agregar el vehículo:', err);
            return res.status(500).json({ error: 'Error al agregar el vehículo', details: err.message });
        }
        res.status(201).json({ message: 'Vehículo agregado exitosamente', vehiculoId: result[0][0].vehiculoId });
    });
});

// Modificar un vehiculo
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { PLACA, N_TARJETA, N_MOTOR, MARCA, COLOR, ANO_DE_COMPRA,
        SEGURO_ID, ASOCIACION_ID, ID_USUARIO_MODIFICACION,
        PROPIETARIO_1_ID, PROPIETARIO_2_ID, N_POLIZA,
        FECHA_VIGENCIA_DESDE, FECHA_VIGENCIA_HASTA } = req.body;

    // Validar campos requeridos
    if (!PLACA || !N_TARJETA || !N_MOTOR || !MARCA || !COLOR || !ANO_DE_COMPRA ||
        !SEGURO_ID || !ASOCIACION_ID || !ID_USUARIO_MODIFICACION ||
        !PROPIETARIO_1_ID || !PROPIETARIO_2_ID || !N_POLIZA ||
        !FECHA_VIGENCIA_DESDE || !FECHA_VIGENCIA_HASTA) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const consulta = `
        CALL SP_V_ModificarVehiculo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        id,
        PLACA, N_TARJETA, N_MOTOR, MARCA, COLOR, ANO_DE_COMPRA,
        SEGURO_ID, ASOCIACION_ID, ID_USUARIO_MODIFICACION,
        PROPIETARIO_1_ID, PROPIETARIO_2_ID, N_POLIZA,
        FECHA_VIGENCIA_DESDE, FECHA_VIGENCIA_HASTA
    ];


    db.query(consulta, valores, (err) => {
        if (err) {
            console.error('Error al modificar el vehículo:', err);
            return res.status(500).json({ error: 'Error al modificar el vehículo', details: err.message });
        }
        res.json({ message: 'Vehículo modificado exitosamente' });
    });
});

// Cambier estado del vehiculo
router.patch('/:id/estado', (req, res) => {
    const id = req.params.id;
    const { estado, id_usuario_modificacion } = req.body;

    // Validar los campos obligatorios
    if (estado === undefined || !id_usuario_modificacion) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const consulta = `
        CALL SP_V_EstadoVehiculo(?, ?, ?)
    `;

    const valores = [id, estado, id_usuario_modificacion];

    db.query(consulta, valores, (err, result) => {
        if (err) {
            console.error('Error al cambiar el estado del vehículo:', err);
            return res.status(500).json({ error: 'Error al cambiar el estado', details: err.message });
        }

        // Verificar si se encontró el vehículo y se realizó la modificación
        if (result[0][0].affectedRows === 0) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        res.json({ message: 'Estado del vehículo actualizado exitosamente' });
    });
});

module.exports = router;
