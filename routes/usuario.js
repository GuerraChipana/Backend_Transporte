const express = require('express');
const router = express.Router();
const db = require('../db'); // Asegúrate de tener tu conexión a la base de datos

// Obtener todos los usuarios
router.get('/', (req, res) => {
    const query = `SELECT id, dni, nombre, apellido, usuario, estado, rol FROM usuario`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.json(results);
    });
});

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

    const query = `INSERT INTO usuario (dni, nombre, apellido, usuario, contrasena, rol, estado, fecha_registro, id_usuario_creacion) VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), ?)`;
    db.query(query, [dni, nombre, apellido, usuario, contrasena, rol, idUsuarioCreador], (err, result) => {
        if (err) {
            console.error('Error al agregar el usuario:', err);
            return res.status(500).json({ error: 'Error al agregar el usuario', detail: err.message });
        }
        res.status(201).json({ message: 'Usuario agregado exitosamente', usuarioId: result.insertId });
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

// Actualizar usuario y contraseña
router.put('/credenciales/:id', (req, res) => {
    const id = req.params.id;
    const { usuario, contrasena, idUsuarioModificador } = req.body;

    if (!usuario || !contrasena || !idUsuarioModificador) {
        return res.status(400).json({ error: 'Usuario, contraseña y ID de modificador son requeridos' });
    }

    const query = `UPDATE usuario SET usuario = ?, contrasena = ?, id_usuario_modificacion = ?, fecha_modificacion = NOW() WHERE id = ?`;
    db.query(query, [usuario, contrasena, idUsuarioModificador, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar las credenciales del usuario:', err);
            return res.status(500).json({ error: 'Error al actualizar las credenciales del usuario' });
        }
        res.json({ message: 'Credenciales del usuario actualizadas exitosamente' });
    });
});

// Cambiar el estado de un usuario
router.patch('/:id/estado', (req, res) => {
    const id = req.params.id;
    const { estado, idUsuarioModificador } = req.body;

    if (estado === undefined || !idUsuarioModificador) {
        return res.status(400).json({ error: 'El estado y ID de modificador son requeridos' });
    }

    const query = `UPDATE usuario SET estado = ?, id_usuario_modificacion = ?, fecha_modificacion = NOW() WHERE id = ?`;
    db.query(query, [estado, idUsuarioModificador, id], (err, result) => {
        if (err) {
            console.error('Error al cambiar el estado del usuario:', err);
            return res.status(500).json({ error: 'Error al cambiar el estado' });
        }
        res.json({ message: 'Estado del usuario actualizado exitosamente' });
    });
});

module.exports = router;

