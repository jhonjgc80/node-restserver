const jwt = require('jsonwebtoken'); //para verificar que el token sea valido
//====================================
//   middleware para Verificar token
//====================================

let verificaToken = (req, res, next) =>{

    //leemos el header (token) de la peticion GET
    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded)=>{
        if (err) {
            return res.status(401).json({
                ok: false,
                err:{
                    message: 'Token no valido'
                }
            });
        }

        //dentro del decoded vamos a encontrar toda la informacion del usuario
        req.usuario = decoded.usuario;
        next(); //se llama para que continue la ejecucion del codigo despues de la
                //verificacion del token

    });
};

//=======================================
//   middleware para Verificar AdminRole
//=======================================
let verificaAdminRole = (req, res, next)=>{
    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    }else{
        return res.json({
            ok: false,
            err:{
                message: 'El usuario no es administrador'
            }
        });
    }
}

//===============================================
//   middleware para Verificar token para imagen
//===============================================
let verificaTokenImg = (req, res, next)=>{

    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded)=>{
        if (err) {
            return res.status(401).json({
                ok: false,
                err:{
                    message: 'Token no valido'
                }
            });
        }

        //dentro del decoded vamos a encontrar toda la informacion del usuario
        req.usuario = decoded.usuario;
        next(); //se llama para que continue la ejecucion del codigo despues de la
                //verificacion del token

    });
}


module.exports = {
    verificaToken,
    verificaAdminRole,
    verificaTokenImg
};