require('./config/config');

const express = require('express');
const mongoose = require('mongoose'); //usado para conectarse a la base de datos Mongodb

const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

//configuracion global de rutas desde el archivo index.js
app.use(require('./routes/index'));

//funcion para establecer la conexion
mongoose.connect(process.env.URLDB, {useNewUrlParser: true}, (err,res) =>{
    //si hay un error en la conexion
    if (err) throw err;
    //si se conecta
    console.log('Base de datos ONLINE');
});

app.listen(process.env.PORT, ()=>{
    console.log('Escuchando por el puerto: ', process.env.PORT);
});

