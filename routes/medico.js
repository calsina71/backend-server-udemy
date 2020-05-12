// Requires
var express = require ('express');

var mdAutenticacion = require('../middlewares/autenticacion');
// var SEED = require('../config/config').SEED;

var app = express();

var Medico = require ('../models/medico');

// ===========================================
//         Obtener todos los médicos
// ===========================================
app.get('/', ( req, res, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find( {} )
            .skip(desde)
            .limit(5)
            .populate( 'usuario', 'nombre email')
            .populate( 'hospital')
            .exec(
                ( err, medicos ) => {

                    if ( err ) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando médico!',
                            errors: err
                        });        
                    }
                    
                    Medico.count( {}, ( err, conteo) => {

                        res.status(200).json({
                            ok: true,
                            medicos: medicos,
                            total: conteo 

                        });

                    });

                });
            

});

// ===========================================
//         obtener un médico
// ===========================================
app.get('/:id', ( req, res ) => {

    var id = req.params.id;

    Medico.findById( id )
    .populate( 'usuario', 'nombre email img')
    .populate( 'hospital')
    .exec( (err, medico ) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar médico',
                errors: err
            });        
        }

        if ( !medico ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico con Id: ' + id + ' no existe',
                errors: { message: 'No existe el médico con ese Id.'}
            });   
            
        }

        res.status(200).json({
            ok: true,
            medico: medico
        });

    });

});


// ===========================================
//         Actualizar un médico
// ===========================================
app.put( '/:id', mdAutenticacion.verificaToken, ( req, res ) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById( id, ( err, medico ) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar médico',
                errors: err
            });        
        }

        if ( !medico ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico con Id: ' + id + ' no existe',
                errors: { message: 'No existe el médico con ese Id.'}
            });        
        }

        medico.nombre = body.nombre;
        // médicos.img = body.img;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital; 

        medico.save( (err, medicoGuardado ) =>{

            if ( err ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar médico!',
                    errors: err
                });        
            }
    
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
    
});


// ===========================================
//         Crear un médico
// ===========================================
app.post( '/', mdAutenticacion.verificaToken, ( req, res ) => {

    var body = req.body;
    
    var medico = new Medico({

        nombre: body.nombre,
        // img: body.img;
        usuario: req.usuario._id,
        hospital: body.hospital,

    });

    medico.save( (err, medicoGuardado ) =>{

        if ( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear médico!',
                errors: err
            });        
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            mensaje: 'El médico ' + medico.nombre + ' ha sido dado de alta'
        });

    });

});


// ===========================================
//             Eliminar un médico
// ===========================================
app.delete( '/:id', mdAutenticacion.verificaToken, ( req, res ) => {

    var id = req.params.id;
    
    Medico.findByIdAndRemove( id, ( err, medicoBorrado ) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar médico',
                errors: err
            });        
        }

        if ( !medicoBorrado ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico con Id: ' + id + ' no existe',
                errors: { message: 'No existe el médico con ese Id.'}
            });        
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
            mensaje: 'El médico ' + medicoBorrado.nombre + ' ha sido eliminado'
        });


    });

});

module.exports = app;