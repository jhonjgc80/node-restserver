const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');
//importamos el middleware que verifica el token
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion'); 

const app = express();

//usado para obtener registros
app.get('/usuario', verificaToken, (req, res) => {
    
    //usamos una funcion de mongoose para traer todos 
    //los registros de la base de datos con limites 
    //de 5 registros por peticion
    let desde = req.query.desde || 0;
    let limite = req.query.limite || 5;
    desde = Number(desde); //transformamos desde a numero
    limite = Number(limite);
    //filtramos los campos de los resultados de una peticion GET
    //dentro del find indicamos los campos a filtrar y adicionamos el estado para que solo muestre y 
    //cuente los registros con estado: true

    Usuario.find({estado: true}, 'nombre email role estado google img').skip(desde).limit(limite).exec((err, usuarios)=>{
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //retornamos el numero de registros de una coleccion
        Usuario.countDocuments({estado: true}, (err, conteo)=>{
            res.json({
                ok: true,
                usuarios,
                cuantos: conteo
            });  
        })

       
    })
  });
  
  //usado para crear nuevos registros
  app.post('/usuario', [verificaToken, verificaAdminRole], (req, res) => {
    let body = req.body;

        let usuario = new Usuario({
            nombre: body.nombre,
            email: body.email,
            password: bcrypt.hashSync( body.password, 10 ),
            role: body.role
        });

        usuario.save((err, usuarioDB)=>{
            if(err){
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            //para no mostrar informacion sobre la contraseña
            //usuarioDB.password = null;

            res.json({
                ok: true,
                usuario: usuarioDB
            });
        });      
    });
  
  //PUT y PATCH muy usados para actualizar registros
  app.put('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {
      let id = req.params.id;
      //aplicamos una funcion de underscore que filtra un objeto extrayendo
      //solo los elementos indicados
      let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);
      

      //usando {new: true} nos muestra la informacion de la base de datos actualizada
      //si no lo usamos nos muestra la informacion del registro anterior antes de la actualizacion 
      Usuario.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, usuarioDB)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        };
        
        res.json({
            ok: true,
            usuario: usuarioDB
        });
      })

      
    });
  
  //delete usado para borrar registros aunque en las bases de datos ya no se acostumbra, 
  //solo se usa para actualiar el estado de un registro para que ya no este disponible
  app.delete('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {
      //necesitamos conocer el id del registro que vamos a borrar
      //para ello lo obtenemos asi:
    let id = req.params.id;
    //realizamos la eliminacion fisica del registro de la DB 
    //dejamos comentada esta funcion por defecto
            // Usuario.findByIdAndRemove(id, (err, usuarioBorrado)=>{
            //     if(err || !usuarioBorrado){
            //         return res.status(400).json({
            //             ok: false,
            //             err:{
            //                 message: 'Usuario no encontrado'
            //             }
            //         });
            //     };
            //     res.json({
            //         ok: true,
            //         usuario: usuarioBorrado
            //     });
            // });

    //en esta otra opcion en lugar de eliminar el registro fisicamente solo lo deshabilitamos
    //cambiando su estado a false, una forma es extrayendo el atributo estado usando (pick) 
    //y cambiando a false desde postman o modificandolo directamente desde acá
    let body = _.pick(req.body,['estado']);
    
    Usuario.findByIdAndUpdate(id, {estado: false}, {new: true, runValidators: true}, (err, usuarioDeshabilitado)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'Usuario no encontrado'
                }
            });
        };
        
        res.json({
            ok: true,
            usuario: usuarioDeshabilitado
        });
      })

});

module.exports = app;