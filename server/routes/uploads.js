//COdigo que permite la carga de archivos usando el paquete fileupload
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const path = require('path');

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// default options
app.use(fileUpload());

//definimos los archivos si son de tipo usuario o tipo producto 
app.put('/upload/:tipo/:id', function(req, res) {
    let tipo = req.params.tipo;
    let id = req.params.id;
    if (Object.keys(req.files).length == 0) {
        return res.status(400)
            .json({
                ok: false,
                err:{message:'No hay archivos cargados.'}
            });
    }
    //valida que los archivos sean del tipo usuario o producto
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err:{
                message: `Los tipos de archivos permitidos son: ${tiposValidos.join(', ')}`
            }
        });
    }
    let archivo = req.files.archivo;
    //obtenemos la extension del archivo a subir
    let nombreDividido = archivo.name.split('.');
    let extension = nombreDividido[nombreDividido.length - 1];
    console.log(extension);
    //validacion de extensiones de archivos permitidas
    let extensionesValidas = ['jpg', 'png', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err:{
                message: `Las extensiones permitidas son: ${extensionesValidas.join(', ')}`,
                Ext: `Extension del archivo: ${extension}`
            }
        })
    }
    //cambiamos el nombre al archivo para que sea unico 
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${extension}`;
     // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err)=> {
        if (err)
        return res.status(500).json({
            ok: false,
            err
        });

        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        }
        if (tipo === 'productos') {
            imagenProducto(id, res, nombreArchivo);
        }
        

    });
});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB)=>{
        if(err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
            ok: false,
            err
            });
        }

        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'Usuario no existe'
                }
            });
        }

        //verificamos que la ruta exista
        // let pathUrlImg = path.resolve(__dirname, `../../uploads/usuarios/${usuarioDB.img}`);
        // if (fs.existsSync(pathUrlImg)) {
        //     fs.unlinkSync(pathUrlImg);
        // }

        borraArchivo(usuarioDB.img, 'usuarios');



        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado)=>{
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        })
    })
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB)=>{
        if(err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
            ok: false,
            err
            });
        }

        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'Producto no existe'
                }
            });
        }

        borraArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;
        console.log(productoDB.img);

        productoDB.save((err, productoGuardado)=>{
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        })

    })
}

function borraArchivo(nombreImagen, tipo) {
    //verificamos que la ruta exista
    let pathUrlImg = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathUrlImg)) {
        fs.unlinkSync(pathUrlImg);
    }
}

module.exports = app;

