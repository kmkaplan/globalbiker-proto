'use strict';

var _ = require('lodash');
var Step = require('./step.model');
var Steppoint = require('../steppoint/steppoint.model');
var Interest = require('../interest/interest.model');
var Q = require('q');

var geo = require('../../components/geo/geo');
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

        for (var key in req.body) {
            if (req.body.hasOwnProperty(key)) {
                step[key] = req.body[key];
            }
        }

        step.distance = geo.getTotalDistanceFromGeometry(step.geometry);

        if (step.geometry) {

            var elevationGain = geo.getElevationGain(step.geometry.type, step.elevationPoints);

            if (elevationGain.lastElevation != null) {
                console.log('Trace has been uploaded (distance: %d, elevation gain: %d, %d).', step.distance, elevationGain.positive, elevationGain.negative);
                step.positiveElevationGain = elevationGain.positive;
                step.negativeElevationGain = elevationGain.negative;
            } else {
                console.log('Trace has been uploaded (distance: %d).', step.distance);
                step.positiveElevationGain = null;
                step.negativeElevationGain = null;
            }
        } else {
                console.log('Trace has been uploaded (distance: %d).', step.distance);
                step.positiveElevationGain = null;
                step.negativeElevationGain = null;
            }
        

        step.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, step);
        });
    });
};

exports.uploadTrace = function (req, res) {

    var stepId = req.body.stepId;

    Step.findById(stepId, function (err, step) {
        if (err) {
            return handleError(res, err);
        }
        if (!step) {
            console.log('Step "%s" does not exists.', stepId);
            return res.send(404);
        }
        var file = req.files.file;

        if (!file) {
            console.log('File "file" is missing.');
            return res.send(400, 'File "file" is missing.');
        }

        geo.readTracesFromFile(file).then(function (features) {

                var feature;

                if (features.length === 0) {
                    console.log('Trace without any feature.');
                    return res.send(400, 'Trace without any point');
                } else if (features.length > 1) {
                    console.log('Trace with %d features(s): first one will be used.', features.length);
                }
                feature = features[0];

                // update step geometry
                step.geometry = {
                    coordinates: feature.xyzCoordinates.xy, //[[[0.951528735, 44.182434697], [0.951036299, 44.182579117]]],
                    type: feature.geometry.type
                };

                step.elevationPoints = feature.xyzCoordinates.z;

                step.distance = geo.getTotalDistanceFromGeometry(step.geometry);

                var elevationGain = geo.getElevationGain(feature.geometry.type, step.elevationPoints);

                if (elevationGain.lastElevation != null) {
                    console.log('Trace has been uploaded (distance: %d, elevation gain: %d, %d).', step.distance, elevationGain.positive, elevationGain.negative);
                    step.positiveElevationGain = elevationGain.positive;
                    step.negativeElevationGain = elevationGain.negative;
                } else {
                    console.log('Trace has been uploaded (distance: %d).', step.distance);
                    step.positiveElevationGain = null;
                    step.negativeElevationGain = null;
                }

                step.save(function (err) {
                    if (err) {
                        console.error(err);
                        return handleError(res, err);
                    }
                    return res.json(200, step);
                });


            },
            function (err) {
                console.log(err);
                return res.send(400, err);
            }).done();

    });

};

exports.removeWithChildren = function (stepId) {

    var deffered = Q.defer();

    // remove steppoints
    Steppoint.find({
        stepId: stepId
    }).remove(function (err, step) {
        if (err) {
            deffered.reject(err);
        }

        // remove interests
        Interest.find({
            stepId: stepId
        }).remove(function (err) {

            if (err) {
                deffered.reject(err);
            }

            // remove step
            Step.findById(stepId).remove(function (err) {
                if (err) {
                    deffered.reject(err);
                }
                deffered.resolve(step);
            });
        });
    });

    return deffered.promise;

}

// Deletes a step from the DB.
exports.destroy = function (req, res) {
    var stepId = req.params.id;

    exports.removeWithChildren(stepId).then(function (step) {
        return res.send(204);
    }, function (err) {
        return handleError(res, err);
    });

};

function handleError(res, err) {
    return res.send(500, err);
}