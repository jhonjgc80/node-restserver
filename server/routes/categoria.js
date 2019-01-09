const express = require('express');
let {verificaToken, verificaAdminRole} = require('../middlewares/autenticacion');
let app = express();

let Categoria = require('../models/categoria');


//==============================
//  Mostrar todas las categorias
//==============================
app.get('/categoria', verificaToken, (req,res) =>{
    Categoria.find({})
    //sort permite especificar que la informacion obtenida este ordenada en forma
    //ascendente o descendente
        .sort('descripcion')
    //populate revisa que id o objectid existe en la categoria y permite
    //cargar la informacion relacionada, en este caso informacion del usuario que creo
    //la categoria
        .populate('usuario', 'nombre email')
        .exec((err, categorias)=>{
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categorias
        });
    });
});

//==============================
//  Mostrar una categoria por ID
//==============================
app.get('/categoria/:id', verificaToken, (req,res) =>{
    let id = req.params.id;
    Categoria.findById(id, (err, categoriaId)=>{
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaId
        });
    });
});

//==============================
//  Crear una nueva categoria
//==============================
app.post('/categoria', verificaToken, (req,res) =>{
    let body = req.body;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });
    categoria.save((err, categoriaDB)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })
});

//==============================
//  Actualiza una categoria existente
//==============================
app.put('/categoria/:id', verificaToken, (req,res) =>{
   let id = req.params.id;
   let body = req.body;

   Categoria.findByIdAndUpdate(id, {descripcion: body.descripcion}, {new: true, runValidators: true}, (err, categoriaDB)=>{
    if(err){
        return res.status(400).json({
            ok: false,
            err
        });
    };

    res.json({
        ok: true,
        categoria: categoriaDB
    });
   })
});

//==============================
//  Elimina una categoria existente
//==============================
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req,res) =>{
    //solo un administrador puede borrar categorias
 
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaBorrada)=>{
        if (err || !categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'Id no encontrado'
                }
            });
        }
        res.json({
            ok:true,
            categoria: categoriaBorrada
        });
    });
});


module.exports = app;