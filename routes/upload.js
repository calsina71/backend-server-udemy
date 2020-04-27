// Requires
var express = require ('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require( '../models/usuario');
var Medico = require( '../models/medico');
var Hospital = require( '../models/hospital');



// default options - Middleware
app.use(fileUpload());

// Rutas
app.put( '/:coleccion/:id', ( req, res, next ) => {

    var coleccion = req.params.coleccion;
    var id = req.params.id;

    // Tipos de colecciones válidas
    var coleccionesValidas = ['hospitales', 'medicos', 'usuarios'];

    if ( coleccionesValidas.indexOf( coleccion ) < 0 ) {

        return res.status(400).json({
            ok: false,
            mensaje: 'La colección no válida',
            errors: { mensaje: 'Las colecciones válidas son: ' + coleccionesValidas.join(', ') }
        });

    }

    if ( !req.files ) {

        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó ningun archivo',
            errors: { mensaje: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[ nombreCortado.length - 1 ]; 
     
    // Aceptar sólo estas extensiones de imagen
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if( extensionesValidas.indexOf( extensionArchivo ) < 0 ) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { mensaje: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
        });

    }

    // Nombre de archivo personalizado
    nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo de un temporal a un path
    var path = `./uploads/${ coleccion }/${ nombreArchivo }`;

    archivo.mv( path, err => {

        if ( err ) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });

        }

        subirPorColeccion( coleccion, id, nombreArchivo, res );

    });

});


function subirPorColeccion( coleccion, id, nombreArchivo, res ) {

    if( coleccion === 'usuarios' ) {

        Usuario.findById( id, ( err, usuario ) => {

            if ( !usuario ) {
                
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El Id de usuario no existe',
                    errors: { message: 'El Id del usuario no existe'}
                });
                
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe, elimina la imagen anterior
            if( fs.existsSync( pathViejo ) ) {

                fs.unlinkSync( pathViejo );
            }

            usuario.img = nombreArchivo;

            usuario.save( (err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                if ( err ) {

                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al grabar archivo',
                        errors: err
                    });
        
                }
            
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
                
            });

        });

    }


    if( coleccion === 'medicos' ) {

        Medico.findById( id, ( err, medico ) => {
            
            if ( !medico ) {
                
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El Id del médico no existe',
                    errors: { message: 'El Id del médico no existe'}
                });
                
            }
            
            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe, elimina la imagen anterior
            if( fs.existsSync( pathViejo ) ) {
                fs.unlinkSync( pathViejo );
            }

            medico.img = nombreArchivo;

            medico.save( (err, medicoActualizado) => {

                if ( err ) {

                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al grabar archivo',
                        errors: err
                    });
        
                }
                
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de médico actualizado',
                    medico: medicoActualizado
                });
                
            });

        });

    }


    if( coleccion === 'hospitales' ) {

        Hospital.findById( id, ( err, hospital ) => {
            
            if ( !hospital ) {
                
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El Id del hospital no existe',
                    errors: { message: 'El Id del hospital no existe'}
                });
                
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe, elimina la imagen anterior
            if( fs.existsSync( pathViejo ) ) {
                
                fs.unlinkSync( pathViejo );
            }

            hospital.img = nombreArchivo;

            hospital.save( (err, hospitalActualizado) => {

                if ( err ) {

                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al grabar archivo',
                        errors: err
                    });
        
                }
                
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del hospital actualizado',
                    hospital : hospitalActualizado
                });
                
            });

        });
        
    }

}

module.exports = app;