require('./config/config');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

//usado para obtener registros
app.get('/usuario', (req, res) => {
  res.json('get Usuario');
});

//usado para crear nuevos registros
app.post('/usuario', (req, res) => {
    let body = req.body;

    if (body.nombre === undefined) {
        res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario'
        });   
    } else {
        res.json({
            persona: body
        });
    }
    
  });

//PUT y PATCH muy usados para actualizar registros
app.put('/usuario/:id', (req, res) => {
    let id = req.params.id;
    res.json({
        id
    });
  });

//delete usado para borrar registros aunque en las bases de datos ya no se acostumbra, 
//solo se usa para actualiar el estado de un registro para que ya no este disponible
app.delete('/usuario', (req, res) => {
    res.json('delete Usuario');
  });
app.listen(process.env.PORT, ()=>{
    console.log('Escuchando por el puerto: ', process.env.PORT);
});