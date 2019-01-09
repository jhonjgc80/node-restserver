//archivo nos permite cambiar entre entorno de desarrollo y produccion
//entre otros

//===============
//     puerto
//===============

process.env.PORT = process.env.PORT || 3000;

//===============
//     Entorno
//===============

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//===============================
//     vencimiento del token jwt
//===============================
//30 dias
process.env.CADUCIDAD_TOKEN = '30d';

//====================================
//     SEED (semilla) de autenticacion
//====================================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';


//==================
//     Base de datos
//==================

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    //usamos la variable de entorno creada desde el terminal con heroku
    urlDB = process.env.MONGO_URI;
    
}

process.env.URLDB = urlDB;

//=======================
//  Google client ID   //
//=======================
process.env.CLIENT_ID = process.env.CLIENT_ID || '404210854292-4j4ui3p0kec3142auo04eu5n5qedcpbv.apps.googleusercontent.com';


