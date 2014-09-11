'use strict';

var _ = require('lodash');
var Step = require('./step.model');

var sys = require('sys');

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
 * Get steps by tour.
 */
exports.getByTour = function (req, res) {

    var tourId = req.params.tourId;
    Step.find({
        'tourId': tourId
    }).sort({
        'stepIndex': 1
    }).exec(function (err, steps) {
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

/*        if (req.body.points) {
            // FIXME this is a FIX because _.merge create all items with value of first one!!!
            step.points = req.body.points;
        }

        if (req.body.markers) {
            // FIXME this is a FIX because _.merge create all items with value of first one!!!
            step.markers = req.body.markers;
        }*/

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
    Step.findById(req.params.id,
        function (err, step) {
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
