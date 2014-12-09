"use strict";

var winston = require('winston');
var mkdirp = require('mkdirp');

var logDir = 'logs';

winston.configureLogger = function () {

    mkdirp(logDir, function (err) {
        if (err) {
            logger.error('Error creating directory "%s": "%s"', logDir, err.message);
        } else {

            // configure logger
            winston.emitErrs = true;

            winston.remove(winston.transports.Console);
            winston.add(winston.transports.Console, {
                level: 'debug',
                colorize: true
            });

            winston.add(winston.transports.File, {
                level: 'silly',
                filename: logDir + '/globalbiker.log',
                json: false
            });
        }
    });

}


module.exports = winston;