/**
 * - Levanta servidor express
 * - Asigna web estático en path publico
 * - Manejo de rutas (importo routes)
 */

const express = require('express');
const path = require('path');
const app = express();
const routes = require('./routes');

// indico carpeta para levantar y puerto
const publicPath = path.resolve(__dirname, '../public');
const port = process.env.PORT || 3000;


// en versiones anteriores de express formaban parte de bodyParser. 
// A partir de la 4.16(express), se ha integrado en la misma.
app.use(express.json()); // support json encoded bodies
// //  
/**
 * parse application/x-www-form-urlencoded, basically can only parse 
 * incoming Request Object if strings or arrays
 */
// app.use(express.urlencoded({ extended: false }));
/**
 * combines the 2 above, then you can parse incoming Request Object if object,
 * with nested objects, or generally any type.
 */
app.use(express.urlencoded({ extended: true }));


// habilito CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Asigno el path publico como directorio público
app.use(express.static(publicPath));

// Rutas. Todas las rutas de routes se le añade antes un /api
app.use('/api', routes );


// levanto el servidor en el puerto indicado.
app.listen(port, (err) => {
    if (err) throw new Error(err);
    console.log(`Servidor corriendo en puerto ${ port }`);
});