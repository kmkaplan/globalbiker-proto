/**
 * Main application routes
 */

'use strict';

var express = require('express');
var multer  = require('multer')
var errors = require('./components/errors');

module.exports = function (app) {


    app.use(multer({
        dest: __dirname + '/uploads/'
    }))

    app.use('/photos', express.static(__dirname + '/photos'));


    // Insert routes below
    app.use('/api/licenses', require('./api/license'));
    app.use('/api/bikelanes', require('./api/bikelane'));
    app.use('/api/interests', require('./api/interest'));
    app.use('/api/mailings', require('./api/mailing'));
    app.use('/api/steps', require('./api/step'));
    app.use('/api/tours', require('./api/tour'));
    app.use('/api/users', require('./api/user'));

    app.use('/auth', require('./auth'));

    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
        .get(errors[404]);

    // All other routes should redirect to the index.html
    app.route('/*')
        .get(function (req, res) {
            res.sendfile(app.get('appPath') + '/index.html');
        });
};