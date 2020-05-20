var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// ===========================================
//         Verificar token  (middleware)
// ===========================================
exports.verificaToken = function(req, res, next ) {

    var token = req.query.token;

    jwt.verify( token, SEED, ( err, decoded ) => {

        if ( err ) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });        
        }

        req.usuario = decoded.usuario;
        
        next();

        // res.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });

    });
};


// ==========================================
//  Verificar ADMIN
// ==========================================
exports.verificaADMIN_ROLE = function(req, res, next) {


    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {

        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador',
            errors: { message: 'No es administrador, no puede hacer eso' }
        });

    }

};


// ==============================================================
//   Verificar ADMIN_ROLE o si es el mismo usuario  (middleware)
// ==============================================================
exports.verificaADMIN_ROLE_o_PropioUsuario = function(req, res, next ) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id ) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto, no eres Administrador',
            errors: { Mensaje: 'No eres Administrador, no tienes acceso.'}
        });     
    }
        
};