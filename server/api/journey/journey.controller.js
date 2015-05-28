'use strict';

var _ = require('lodash');
var Journey = require('./journey.model');
var jsonpatch = require('fast-json-patch');
var ObjectId = require('mongoose').Types.ObjectId;
var JourneyService = require('./journey.service');
var config = require('../../config/environment');

function isAdmin(req) {
    return req.user && req.user._id && config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf('admin');
}

// Get list of journeys
exports.index = function (req, res) {
    Journey.find(function (err, journeys) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, journeys);
    });
};

// Get a single journey
exports.show = function (req, res) {
    Journey.findOne({
        reference: req.params.reference
    }).exec(function (err, journey) {
        if (err) {
            return handleError(res, err);
        }
        if (!journey) {
            return res.send(404);
        }
        return res.json(journey);
    });
};

// Creates a new journey in the DB.
exports.create = function (req, res) {

    // set author
    req.body.authors = [req.user._id];

    Journey.create(req.body, function (err, journey) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, journey);
    });
};

exports.patch = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    var params = {
        reference: req.params.reference
    };
    if (!isAdmin(req)) {
        // check that current user is one of the authors
        params.authors = req.user._id;
    }
    Journey.findOne(params).exec(function (err, journey) {

        if (err) {
            return handleError(res, err);
        }
        if (!journey) {
            return res.send(404);
        }

        var patches = req.body.patches;
        
        jsonpatch.apply(journey, patches);

        journey.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, journey);
        });
    });
};

// Deletes a journey from the DB.
exports.destroy = function (req, res) {
    Journey.findOne({
        reference: req.params.reference
    }).exec(function (err, journey) {
        if (err) {
            return handleError(res, err);
        }
        if (!journey) {
            return res.send(404);
        }
        journey.remove(function (err) {
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