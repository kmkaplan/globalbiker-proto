'use strict';

var _ = require('lodash');
var Step = require('./step.model');

// Get list of steps
exports.index = function (req, res) {
    Step.find(function (err, steps) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, steps);
    });
};

/**
 * Get photos.
 */
exports.getByTour = function (req, res) {

    var tourId = req.params.tourId;

    Step.find({
        'tour': tourId
    }, function (err, steps) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, steps);
    });
};


// Get a single step
exports.show = function (req, res) {
    Step.findById(req.params.id, function (err, step) {
        if (err) {
            return handleError(res, err);
        }
        if (!step) {
            return res.send(404);
        }
        return res.json(step);
    });
};

// Creates a new step in the DB.
exports.create = function (req, res) {
    Step.create(req.body, function (err, step) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, step);
    });
};

// Updates an existing step in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Step.findById(req.params.id, function (err, step) {
        if (err) {
            return handleError(res, err);
        }
        if (!step) {
            return res.send(404);
        }
        var updated = _.merge(step, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, step);
        });
    });
};

// Deletes a step from the DB.
exports.destroy = function (req, res) {
    Step.findById(req.params.id, function (err, step) {
        if (err) {
            return handleError(res, err);
        }
        if (!step) {
            return res.send(404);
        }
        step.remove(function (err) {
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