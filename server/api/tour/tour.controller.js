'use strict';

var _ = require('lodash');
var Tour = require('./tour.model');
var Step = require('../step/step.model');
var stepController = require('../step/step.controller');
var auth = require('../../auth/auth.service');

var Q = require('q');

// Get list of tours
exports.index = function (req, res) {

    Tour.find(function (err, tours) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, tours);
    });
};

// Get a single tour
exports.show = function (req, res) {
    Tour.findById(req.params.id, function (err, tour) {
        if (err) {
            return handleError(res, err);
        }
        if (!tour) {
            return res.send(404);
        }
        return res.json(tour);
    });
};

/**
 * Get steps by tour.
 */
exports.mines = function (req, res) {

    var userId = req.user._id;

    Tour.find({
        'userId': userId
    }, function (err, tours) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, tours);
    });
};

// Creates a new tour in the DB.
exports.create = function (req, res) {
    Tour.create(req.body, function (err, tour) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, tour);
    });
};

// Updates an existing tour in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Tour.findById(req.params.id, function (err, tour) {
        if (err) {
            return handleError(res, err);
        }
        if (!tour) {
            return res.send(404);
        }
       for (var key in req.body) {
            if (req.body.hasOwnProperty(key)) {
                tour[key] = req.body[key];
            }
        }
        
        tour.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, tour);
        });
    });
};

// Deletes a tour from the DB.
exports.destroy = function (req, res) {
    var tourId = req.params.id;

    Tour.findById(tourId, function (err, tour) {
        if (err) {
            return handleError(res, err);
        }
        if (!tour) {
            return res.send(404);
        }

        // remove steps
        Step.find({
            tourId: tour._id
        }).exec(function (err, steps) {

            var defferedArray = steps.reduce(function (output, step) {

                output.push(stepController.removeWithChildren(step.id));
                return output;
            }, []);

            return Q.all(defferedArray).then(function () {

                // remove tour
                tour.remove(function (err) {
                    if (err) {
                        return handleError(res, err);
                    }
                    return res.send(204);
                });

            }, function () {
                return handleError(res, err);
            });

        });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}