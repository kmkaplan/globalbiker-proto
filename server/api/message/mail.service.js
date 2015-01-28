'use strict';

var config = require('../../config/environment');
var logger = require('../../components/logger/logger');

var Q = require('q');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport(smtpTransport(config.mail.smtpTransport));

exports.sendMail = function (mailOptions) {
    var deffered = Q.defer();

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            logger.error(err);
            deffered.reject(err);
        } else {
            // tour updated
            logger.info('Message sent. Response: %s', info.response, {});
            return deffered.resolve(info);
        }
    });

    return deffered.promise;
};