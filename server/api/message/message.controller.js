'use strict';

var _ = require('lodash');
var Message = require('./message.model');
var mailService = require('./mail.service');
var logger = require('../../components/logger/logger');
var config = require('../../config/environment');

// Get list of messages
exports.index = function (req, res) {
    Message.find(function (err, messages) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, messages);
    });
};

// Get a single message
exports.show = function (req, res) {
    Message.findById(req.params.id, function (err, message) {
        if (err) {
            return handleError(res, err);
        }
        if (!message) {
            return res.send(404);
        }
        return res.json(message);
    });
};

// Creates a new message in the DB.
exports.create = function (req, res) {
    
   var mailOptions = {
        from: req.body.email,
        to: config.mail.contactRecipient,
        subject: req.body.subject,
        text: req.body.message
    };
    
    logger.info('Sent mail from "%s" to "%s".', mailOptions.from, mailOptions.to);
    
    mailService.sendMail(mailOptions).then(function(){
        return res.status(201).send()
    },function(err){
        return handleError(res, err);
    });
};

// Updates an existing message in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Message.findById(req.params.id, function (err, message) {
        if (err) {
            return handleError(res, err);
        }
        if (!message) {
            return res.send(404);
        }
        var updated = _.merge(message, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, message);
        });
    });
};

// Deletes a message from the DB.
exports.destroy = function (req, res) {
    Message.findById(req.params.id, function (err, message) {
        if (err) {
            return handleError(res, err);
        }
        if (!message) {
            return res.send(404);
        }
        message.remove(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}