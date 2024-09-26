const express = require('express');
const cors = require('cors'); // Asegúrate de que esto esté importado
const app = express();
const port = 3002;

// Importar la conexión a la base de datos
const db = require('./db'); // Adjust path as necessary


// Importar rutas
const propietariosRouter = require('./routes/propietarios');
const segurosRouter = require('./routes/SeguroVehicular');
const testRouter = require('./routes/test');
const loginRouter = require('./routes/Login')
const asociacionesRouter = require('./routes/asociaciones'); 
const vehiculoRouter = require('./routes/vehiculo'); // Add this line

// Configurar middleware
app.use(express.json());
app.use(cors({    origin: '*'}));

// Usar rutas
app.use('/api/propietarios', propietariosRouter);
app.use('/api/seguros', segurosRouter);
app.use('/test', testRouter);
app.use('/api/login', loginRouter);
app.use('/api/vehiculo',vehiculoRouter);
app.use('/api/asociaciones', asociacionesRouter);


// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

