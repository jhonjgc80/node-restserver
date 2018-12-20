const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');//para generar el jwt

const Usuario = require('../models/usuario');
const app = express();

app.post('/login', (req, res)=>{
    //obtenemos el correo y el password enviados por el usuario
    let body = req.body;

    //verificamos si el correo existe usando el schema completo
    Usuario.findOne({ email: body.email }, (err, usuarioDB)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //preguntamos si el usuario no existe en la DB
        if ((!usuarioDB)) {    
            return res.status(500).json({
                ok: false,
                err:{
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }

        //evaluamos la contraseña encriptandola y verificando si hace match
        //mediante la funcion compareSync del bcrypt que devuelve un true o false
        // si la contraseña ingresada por el usuario coincide con la almacenada en DB
        if(!bcrypt.compareSync(body.password, usuarioDB.password)){
            return res.status(500).json({
                ok: false,
                err:{
                    message: 'Usuario o Contraseña incorrectos'
                }
            });
        }
        

        //de esta forma se genera el jwt, la semilla y la expiracion estan
        //en al archivo config.js
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok:true,
            usuario: usuarioDB,
            token
        });
    });
});



module.exports = app;