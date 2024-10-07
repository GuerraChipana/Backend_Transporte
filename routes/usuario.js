const express = require('express');
const router = express.Router();
const db = require('../db'); 

// Obtener todos los usuarios
router.get('/', (req, res) => {
    db.query('CALL SP_U_ObtenerUsuarios()', (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.json(results[0]);
    });
});

// Obtener un usuario por ID
router.get('/:id', (req, res) => {
    const id = req.params.id;
    db.query('CALL SP_U_ObtenerUsuariosID(?)', [id], (err, result) => {
        if (err) {
            console.error('Error al obtener el usuario:', err);
            return res.status(500).json({ error: 'Error al obtener el usuario' });
        }
        if (result[0].length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(result[0][0]);
    });
});

// Agregar un nuevo usuario
router.post('/', (req, res) => {
    const { dni, nombre, apellido, usuario, contrasena, rol, idUsuarioCreador } = req.body;

    // Verificar que todos los campos requeridos estén presentes
    if (!dni || !nombre || !apellido || !usuario || !contrasena || rol === undefined || !idUsuarioCreador) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Validar rol (1 o 2)
    if (rol !== 1 && rol !== 2) {
        return res.status(400).json({ error: 'Rol inválido. Debe ser 1 (superadministrador) o 2 (administrador).' });
    }

    // Validar que el DNI tenga 8 dígitos
    if (dni.length !== 8) {
        return res.status(400).json({ error: 'El DNI debe tener exactamente 8 dígitos.' });
    }

    // Verificar que el nombre de usuario sea único
    const checkUserQuery = `SELECT * FROM usuario WHERE usuario = ?`;
    db.query(checkUserQuery, [usuario], (err, result) => {
        if (err) {
            console.error('Error al verificar el usuario existente:', err);
            return res.status(500).json({ error: 'Error al verificar el usuario existente', detail: err.message });
        }

        if (result.length > 0) {
            return res.status(400).json({ error: 'El nombre de usuario ya está en uso.' });
        }

        // Si pasa todas las validaciones, insertar el nuevo usuario
        db.query('CALL SP_U_AgregarUsuario(?, ?, ?, ?, ?, ?, ?)', [dni, nombre, apellido, usuario, contrasena, rol, idUsuarioCreador], (err, result) => {
            if (err) {
                console.error('Error al agregar el usuario:', err);
                return res.status(500).json({ error: 'Error al agregar el usuario', detail: err.message });
            }
            res.status(201).json({ message: 'Usuario agregado exitosamente', usuarioId: result[0].insertId });
        });
    });
});

// Actualizar nombre, apellido, dni y rol
router.put('/info/:id', (req, res) => {
    const id = req.params.id;
    const { dni, nombre, apellido, rol, idUsuarioModificador } = req.body;

    if (!dni || !nombre || !apellido || rol === undefined || !idUsuarioModificador) {
        return res.status(400).json({ error: 'DNI, nombre, apellido, rol y ID de modificador son requeridos' });
    }

    // Validar rol (1 o 2)
    if (rol !== 1 && rol !== 2) {
        return res.status(400).json({ error: 'Rol inválido. Debe ser 1 (superadministrador) o 2 (administrador).' });
    }

    const query = `UPDATE usuario SET dni = ?, nombre = ?, apellido = ?, rol = ?, id_usuario_modificacion = ?, fecha_modificacion = NOW() WHERE id = ?`;
    db.query(query, [dni, nombre, apellido, rol, idUsuarioModificador, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar la información del usuario:', err);
            return res.status(500).json({ error: 'Error al actualizar la información del usuario' });
        }
        res.json({ message: 'Información del usuario actualizada exitosamente' });
    });
});



// Actualizar credenciales de un usuario
router.put('/credenciales/:id', (req, res) => {
    const id = req.params.id;
    const { usuario, contrasenaActual, contrasenaNueva, contrasenaConfirmacion, idUsuarioModificador } = req.body;

    // Validar campos requeridos
    if (!usuario || !contrasenaActual || !contrasenaNueva || !contrasenaConfirmacion || !idUsuarioModificador) {
        return res.status(400).json({ error: 'Usuario, contraseña actual, nueva, confirmación y ID de modificador son requeridos' });
    }

    // Verificar que la nueva contraseña y su confirmación coincidan
    if (contrasenaNueva !== contrasenaConfirmacion) {
        return res.status(400).json({ error: 'La nueva contraseña y su confirmación deben coincidir.' });
    }

    // Llamar al procedimiento almacenado
    db.query('CALL SP_U_ModificarCredenciales(?, ?, ?, ?, ?, ?)', [id, usuario, contrasenaActual, contrasenaNueva, contrasenaConfirmacion, idUsuarioModificador], (err, result) => {
        if (err) {
            console.error('Error al actualizar las credenciales del usuario:', err);
            return res.status(500).json({ error: err.sqlMessage || 'Error al actualizar las credenciales del usuario' });
        }
        res.json({ message: 'Credenciales del usuario actualizadas exitosamente' });
    });
});

// Cambiar estado de un usuario
router.patch('/:id/estado', (req, res) => {
    const id = req.params.id;
    const { estado, idUsuarioModificador } = req.body;

    if (estado === undefined || !idUsuarioModificador) {
        return res.status(400).json({ error: 'El estado y ID de modificador son requeridos' });
    }

    db.query('CALL SP_U_EstadoUsuario(?, ?, ?)', [id, estado, idUsuarioModificador], (err, result) => {
        if (err) {
            console.error('Error al cambiar el estado del usuario:', err);
            return res.status(500).json({ error: 'Error al cambiar el estado' });
        }
        res.json({ message: 'Estado del usuario actualizado exitosamente' });
    });
});

module.exports = router;
