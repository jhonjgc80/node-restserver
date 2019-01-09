
const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');
const Producto = require('../models/producto');
const _ = require('underscore');

const app = express();

//==============================
//  Mostrar todas las productos
//==============================
app.get('/productos', verificaToken, (req, res)=>{
    //trae todos los productos
    //populate: usuario categoria
    //paginado

    let desde = req.query.desde || 0;
    let limite = req.query.limite || 5;
    desde = Number(desde); 
    limite = Number(limite);

    Producto.find({disponible: true}).skip(desde).limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos)=>{
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            });
        })


});

//==============================
//  Obtener un producto por ID
//==============================
app.get('/producto/:id', (req, res)=>{
    //populate: usuario categoria
    let id = req.params.id;
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoId)=>{
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoId) {
                return res.status(400).json({
                    ok: false,
                    err:{message:'Id de producto inexistente'}
                });
            }
    
            res.json({
                ok: true,
                producto: productoId
            }); 
        })
});

//==============================
//  Buscar productos
//==============================
app.get('/producto/buscar/:termino', verificaToken, (req, res)=>{
    
    let termino = req.params.termino;

    //para hacer la busqueda mas flexible necesitamos usar una expresion regular
    //se le manda 'i' para que sea insensible a mayysculas, minusculas, etc
    let regExp = new RegExp(termino, 'i');

    Producto.find({nombre: regExp}).populate('categoria', 'nombre')
        .exec((err, productos)=>{
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            }); 
        })
});
//==============================
//  Crear un nuevo producto
//==============================
app.post('/producto', verificaToken, (req, res)=>{
    //grabar el usuario
    //grabar una categoria del listado
    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    })
});

//==============================
//  Actualizar un producto
//==============================
app.put('/producto/:id', verificaToken, (req, res)=>{
    //grabar el usuario
    //grabar una categoria del listado
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'disponible', 'categoria']);

    Producto.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, productoDB)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        };

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

//==============================
//  borrar un producto
//==============================
app.delete('/producto/:id', verificaToken, (req, res)=>{
    //disponible igual a false, no eliminar fisicamente
    let id = req.params.id;
    let body = _.pick(req.body, ['disponible']);

    Producto.findByIdAndUpdate(id, {disponible: false}, {new: true, runValidators: true}, (err, productoDeshabilitado)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'Producto no encontrado'
                }
            });
        };
        
        res.json({
            ok: true,
            producto: productoDeshabilitado
        });
    });

});


module.exports = app;