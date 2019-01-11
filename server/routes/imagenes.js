//codigo que permite al usuario (frontend) acceder a los archivos almacenados en el servidor
const express = require('express');
const fs = require('fs');
const path = require('path');
const {verificaTokenImg} = require('../middlewares/autenticacion')

let app = express();


app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res)=>{
    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathUrlImg = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

    //verificamos si el path anterior existe
    if (fs.existsSync(pathUrlImg)) {
        res.sendFile(pathUrlImg);
    }else{
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
        res.sendFile(noImagePath);
    }

    
})







module.exports = app;