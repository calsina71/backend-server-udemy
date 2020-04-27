// Requires
var express = require ('express');

var app = express();

var Hospital = require ('../models/hospital');
var Medico = require ('../models/medico');
var Usuario = require ('../models/usuario');


// Rutas

// ================================================
//             Busqueda por colección
// ================================================
app.get( '/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var expresionRegular = new RegExp( busqueda, 'i');

    var promesa;

    switch ( tabla ) {
        case 'hospitales': 
            promesa = buscarHospitales( busqueda, expresionRegular );
            break;

        case 'medicos':
            promesa = buscarMedicos( busqueda, expresionRegular );
            break;

        case 'usuarios':
            promesa = buscarUsuarios( busqueda, expresionRegular );
            break;

        default: 
            res.status(400).json({
                ok: false,
                mensaje: 'Sólo se hacepta busquedas de las colecciones: hospitales, medicos, usuarios',
                error: { mensaje: 'Tipo de tabla/colección no válida' }
            });

    }

    promesa.then( data => {

        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });

});


// ================================================
//    Busqueda global - en todas las colecciones
// ================================================
app.get( '/todo/:busqueda', ( req, res, next ) => {

    var busqueda = req.params.busqueda;
    var expresionRegular = RegExp( busqueda, 'i');

    Promise.all( [
            buscarHospitales(busqueda, expresionRegular), 
            buscarMedicos(busqueda, expresionRegular), 
            buscarUsuarios(busqueda, expresionRegular) ] )
        .then( respuestas => {

            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]

            });

        });

});



function buscarHospitales( busqueda, expresionRegular ) {

    return new Promise( (resolve, reject) => {

        Hospital.find( { nombre: expresionRegular } )
                .populate( 'usuario', 'nombre email')
                .exec( (err, hospitales) => {
    
                    if ( err ) {
                        reject('Error al cargar hospitales', err);
                    } else {
                        resolve(hospitales);
                    }
            
        });

    });

}


function buscarMedicos( busqueda, expresionRegular ) {

    return new Promise( (resolve, reject) => {

        Medico.find( { nombre: expresionRegular } )
              .populate( 'usuario', 'nombre email')
              .populate( 'hospital')
              .exec( (err, medicos) => {
    
                if ( err ) {
                    reject('Error al cargar médicos', err);
                } else {
                    resolve(medicos);
                }
    
        });

    });

}


function buscarUsuarios( busqueda, expresionRegular ) {

    return new Promise( (resolve, reject) => {

        Usuario.find( {}, 'nombre email role')
            .or( [{ 'nombre': expresionRegular }, { 'email': expresionRegular } ] )
            .exec( (err, usuarios) => {
    
                if ( err ) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
    
        });

    });

}


module.exports = app;