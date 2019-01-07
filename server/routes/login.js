const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');//para generar el jwt

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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

//configuraciones de google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return{
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
  }

app.post('/google', async (req, res)=>{
    let token = req.body.idtoken;
    let googleUser = await verify(token)
        .catch(e =>{
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    Usuario.findOne({email:googleUser.email}, (err, usuarioDB) =>{
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticacion normal'
                    }
                });
            }else{
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        }else{
            //Si el usuario no existe en nuestra base de datos
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'; 

            usuario.save((err, usuarioDB) =>{
                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });

            })
        }
    })
});



module.exports = app;