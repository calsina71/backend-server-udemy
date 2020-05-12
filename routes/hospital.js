// Requires
var express = require ('express');

var mdAutenticacion = require('../middlewares/autenticacion');
// var SEED = require('../config/config').SEED;

var app = express();

var Hospital = require ('../models/hospital');

// ===========================================
//         Obtener todos los hospitales
// ===========================================
app.get('/todos', ( req, res, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find( {} )
            .populate('usuario', 'nombre email')
            .exec(
                ( err, hospitales ) => {

                    if ( err ) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando hospital!',
                            errors: err
                        });        
                    }
                    
                    Hospital.count( {}, (err, conteo) => {

                        res.status(200).json({
                            ok: true,
                            hospitales: hospitales,
                            total: conteo
                        });

                    });

                });
            

});


// ===========================================
//         Obtener todos los hospitales paginados
// ===========================================
app.get('/', ( req, res, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find( {} )
            .populate('usuario', 'nombre email')
            .skip(desde)
            .limit(5)
            .exec(
                ( err, hospitales ) => {

                    if ( err ) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando hospital!',
                            errors: err
                        });        
                    }
                    
                    Hospital.count( {}, (err, conteo) => {

                        res.status(200).json({
                            ok: true,
                            hospitales: hospitales,
                            total: conteo
                        });

                    });

                });
            

});


// ===========================================
//         Actualizar un hospital
// ===========================================
app.put( '/:id', mdAutenticacion.verificaToken, ( req, res ) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById( id, ( err, hospital ) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });        
        }

        if ( !hospital ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con Id: ' + id + ' no existe',
                errors: { message: 'No existe el hospital con ese Id.'}
            });        
        }

        hospital.nombre = body.nombre;
        // hospital.img = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save( (err, hospitalGuardado ) =>{

            if ( err ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital!',
                    errors: err
                });        
            }
    
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
    
});


// ==========================================
// Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + 'no existe',
                    errors: {
                    message: 'No existe un hospital con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        });
});


// ===========================================
//         Crear un hospital
// ===========================================
app.post( '/', mdAutenticacion.verificaToken, ( req, res ) => {

    var body = req.body;
    
    var hospital = new Hospital({
        nombre: body.nombre,
        // img: body.img,
        usuario: req.usuario._id
    });

    hospital.save( (err, hospitalGuardado ) =>{

        if ( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital!',
                errors: err
            });        
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            mensaje: 'Hospital ' + hospital.nombre + ' ha sido dado de alta'
        });

    });

});


// ===========================================
//             Eliminar un hospital
// ===========================================
app.delete( '/:id', mdAutenticacion.verificaToken, ( req, res ) => {

    var id = req.params.id;
    
    Hospital.findByIdAndRemove( id, ( err, hospitalBorrado ) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });        
        }

        if ( !hospitalBorrado ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con Id: ' + id + ' no existe',
                errors: { message: 'No existe el hospital con ese Id.'}
            });        
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
            mensaje: 'Hospital ' + hospitalBorrado.nombre + ' ha sido eliminado'
        });


    });

});

module.exports = app;