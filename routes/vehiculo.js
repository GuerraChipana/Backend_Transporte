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

        // Obtener nombres de aseguradoras, asociaciones y propietarios
        const consultaSeguros = `SELECT id, aseguradora FROM seguro_vehicular`;
        const consultaAsociaciones = `SELECT id, nombre FROM asociaciones`;
        const consultaPropietarios = `SELECT id, dni FROM propietario`;

        db.query(consultaSeguros, (err, seguros) => {
            if (err) {
                console.error('Error al obtener seguros:', err);
                return res.status(500).json({ error: 'Error al obtener seguros', details: err.message });
            }

            db.query(consultaAsociaciones, (err, asociaciones) => {
                if (err) {
                    console.error('Error al obtener asociaciones:', err);
                    return res.status(500).json({ error: 'Error al obtener asociaciones', details: err.message });
                }

                db.query(consultaPropietarios, (err, propietarios) => {
                    if (err) {
                        console.error('Error al obtener propietarios:', err);
                        return res.status(500).json({ error: 'Error al obtener propietarios', details: err.message });
                    }


                    const formatDate = (dateString) => {
                        const date = new Date(dateString);
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexed
                        const year = date.getFullYear();

                        return `${day}/${month}/${year}`;
                    };

                    const vehiculos = results[0].map(vehiculo => {
                        const seguro = seguros.find(seguro => seguro.id === vehiculo.SEGURO_ID);
                        const asociacion = asociaciones.find(asociacion => asociacion.id === vehiculo.ASOCIACION_ID);
                        const propietario1 = propietarios.find(prop => prop.id === vehiculo.PROPIETARIO_1_ID);
                        const propietario2 = propietarios.find(prop => prop.id === vehiculo.PROPIETARIO_2_ID);

                        return {
                            ...vehiculo,
                            FECHA_VIGENCIA_DESDE: formatDate(vehiculo.FECHA_VIGENCIA_DESDE),
                            FECHA_VIGENCIA_HASTA: formatDate(vehiculo.FECHA_VIGENCIA_HASTA),
                            SEGURO_ID: seguro ? seguro.aseguradora : '',
                            ASOCIACION_ID: asociacion ? asociacion.nombre : '',
                            PROPIETARIO_1_ID: propietario1 ? propietario1.dni : '',
                            PROPIETARIO_2_ID: propietario2 ? propietario2.dni : ''
                        };
                    });


                    res.json({ message: 'Datos obtenidos con éxito', data: vehiculos });
                });
            });
        });
    });
});

// Agregar un nuevo vehículo
router.post('/', (req, res) => {
    const {
        placa, n_tarjeta, n_motor, marca, ano_de_compra,
        n_poliza, fecha_vigencia_desde, fecha_vigencia_hasta,
        propietario_1_dni, propietario_2_dni, id_usuario, asociacion_nombre, color,
        aseguradora // ahora es opcional
    } = req.body;

    // Validar los campos obligatorios
    if (!placa || !n_tarjeta || !n_motor || !marca || !ano_de_compra ||
        !propietario_1_dni || !propietario_2_dni || !id_usuario || !color) {
        return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse' });
    }

    let seguro_id = null;
    if (aseguradora) {
        const consultaSeguro = `SELECT id FROM seguro_vehicular WHERE aseguradora = ?`;
        db.query(consultaSeguro, [aseguradora], (err, seguroResult) => {
            if (err || seguroResult.length === 0) {
                return res.status(400).json({ error: 'Aseguradora no encontrada' });
            }
            seguro_id = seguroResult[0].id;

            continuarConLaLogica();
        });
    } else {
        continuarConLaLogica();
    }

    function continuarConLaLogica() {
        const consultaAsociacion = `SELECT id FROM asociaciones WHERE nombre = ?`;
        let asociacion_id = null;

        if (asociacion_nombre) {
            db.query(consultaAsociacion, [asociacion_nombre], (err, asociacionResult) => {
                if (err || asociacionResult.length === 0) {
                    return res.status(400).json({ error: 'Asociación no encontrada' });
                }
                asociacion_id = asociacionResult[0].id;
                obtenerPropietarios();
            });
        } else {
            obtenerPropietarios();
        }

        function obtenerPropietarios() {
            const consultaPropietario = `SELECT id FROM propietario WHERE dni = ?`;

            db.query(consultaPropietario, [propietario_1_dni], (err, propietario1Result) => {
                if (err || propietario1Result.length === 0) {
                    return res.status(400).json({ error: 'Propietario 1 no encontrado' });
                }
                const propietario_1_id = propietario1Result[0].id;

                db.query(consultaPropietario, [propietario_2_dni], (err, propietario2Result) => {
                    if (err || propietario2Result.length === 0) {
                        return res.status(400).json({ error: 'Propietario 2 no encontrado' });
                    }
                    const propietario_2_id = propietario2Result[0].id;

                    // Insertar el vehículo
                    const consulta = `
                        CALL SP_V_AgregarVehiculo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    const valores = [
                        placa, n_tarjeta, n_motor, marca, color,
                        ano_de_compra, seguro_id, asociacion_id,
                        n_poliza || null, // Si no se proporciona, se pasa null
                        fecha_vigencia_desde || null, // Si no se proporciona, se pasa null
                        fecha_vigencia_hasta || null, // Si no se proporciona, se pasa null
                        propietario_1_id, propietario_2_id, id_usuario
                    ];

                    db.query(consulta, valores, (err, result) => {
                        if (err) {
                            console.error('Error al agregar el vehículo:', err);
                            return res.status(500).json({ error: 'Error al agregar el vehículo', details: err.message });
                        }
                        res.status(201).json({ message: 'Vehículo agregado exitosamente', vehiculoId: result[0][0].vehiculoId });
                    });
                });
            });
        }
    }
});

// Modificar un vehiculo
router.put('/:id', (req, res) => {
    const { id } = req.params;

    const {
        placa, n_tarjeta, n_motor, marca, ano_de_compra,
        n_poliza, fecha_vigencia_desde, fecha_vigencia_hasta,
        propietario_1_dni, propietario_2_dni, id_usuario_modificacion, asociacion_nombre, color,
        aseguradora // ahora es opcional
    } = req.body;

    // Validar los campos obligatorios
    if (!placa || !n_tarjeta || !n_motor || !marca || !ano_de_compra ||
        !propietario_1_dni || !propietario_2_dni || !id_usuario_modificacion || !color) {
        return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse' });
    }

    let seguro_id = null;
    if (aseguradora) {
        const consultaSeguro = `SELECT id FROM seguro_vehicular WHERE aseguradora = ?`;
        db.query(consultaSeguro, [aseguradora], (err, seguroResult) => {
            if (err || seguroResult.length === 0) {
                return res.status(400).json({ error: 'Aseguradora no encontrada' });
            }
            seguro_id = seguroResult[0].id;

            continuarConLaLogica();
        });
    } else {
        continuarConLaLogica();
    }

    function continuarConLaLogica() {
        const consultaAsociacion = `SELECT id FROM asociaciones WHERE nombre = ?`;
        let asociacion_id = null;

        if (asociacion_nombre) {
            db.query(consultaAsociacion, [asociacion_nombre], (err, asociacionResult) => {
                if (err || asociacionResult.length === 0) {
                    return res.status(400).json({ error: 'Asociación no encontrada' });
                }
                asociacion_id = asociacionResult[0].id;
                obtenerPropietarios();
            });
        } else {
            obtenerPropietarios();
        }

        function obtenerPropietarios() {
            const consultaPropietario = `SELECT id FROM propietario WHERE dni = ?`;

            db.query(consultaPropietario, [propietario_1_dni], (err, propietario1Result) => {
                if (err || propietario1Result.length === 0) {
                    return res.status(400).json({ error: 'Propietario 1 no encontrado' });
                }
                const propietario_1_id = propietario1Result[0].id;

                db.query(consultaPropietario, [propietario_2_dni], (err, propietario2Result) => {
                    if (err || propietario2Result.length === 0) {
                        return res.status(400).json({ error: 'Propietario 2 no encontrado' });
                    }
                    const propietario_2_id = propietario2Result[0].id;

                    // Modificar el vehículo
                    const consulta = `
                        CALL SP_V_ModificarVehiculo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    const valores = [
                        id,
                        placa, n_tarjeta, n_motor, marca, color,
                        parseInt(ano_de_compra, 10), // Convertir a entero
                        seguro_id, asociacion_id,
                        n_poliza || null, // Si no se proporciona, se pasa null
                        fecha_vigencia_desde || null, // Si no se proporciona, se pasa null
                        fecha_vigencia_hasta || null, // Si no se proporciona, se pasa null
                        propietario_1_id, propietario_2_id, id_usuario_modificacion
                    ];

                    db.query(consulta, valores, (err) => {
                        if (err) {
                            console.error('Error al modificar el vehículo:', err);
                            return res.status(500).json({ error: 'Error al modificar el vehículo', details: err.message });
                        }
                        res.json({ message: 'Vehículo modificado exitosamente' });
                    });
                });
            });
        }
    }
});

// Cambiar estado del vehiculo
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
