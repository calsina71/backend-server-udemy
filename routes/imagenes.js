// Requires
var express = require ('express');

var app = express();

const path = require('path');
const fs = require('fs');


// Rutas
app.get( '/:coleccion/:img', ( req, res, next ) => {

    var coleccion = req.params.coleccion;
    var img = req.params.img;

    var pathImagen = path.resolve( __dirname, `../uploads/${ coleccion }/${ img }` );


    if( fs.existsSync( pathImagen ) ){
        res.sendFile( pathImagen );
    } else {
        var pathNoImagen = path.resolve( __dirname, '../assets/no-img.jpg' );
        res.sendFile( pathNoImagen );
    }

});

module.exports = app;