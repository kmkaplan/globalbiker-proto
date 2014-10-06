'use strict';

var _ = require('lodash');
var Steppoint = require('./steppoint.model');
var geolib = require('geolib');
var Step = require('../step/step.model');
var geo = require('../../components/geo/geo');
var Q = require('q');

// Get list of steppoints
exports.index = function (req, res) {
    Steppoint.find(function (err, steppoints) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, steppoints);
    });
};

// Get a single steppoint
exports.show = function (req, res) {
    Steppoint.findById(req.params.id, function (err, steppoint) {
        if (err) {
            return handleError(res, err);
        }
        if (!steppoint) {
            return res.send(404);
        }
        return res.json(steppoint);
    });
};

// Creates a new steppoint in the DB.
exports.create = function (req, res) {
    Steppoint.create(req.body, function (err, steppoint) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, steppoint);
    });
};

// Creates a new bikelane in the DB.
exports.upload = function (req, res) {

/*   console.log(req.body)
    console.log(req.files)*/

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

        geo.readTracesFromFile(file).then(function (geojsonContent) {
            
            /*var stepIndex = 0;
            var lineIndex = 0;

            // feature => trace
            var steppoints = traces.reduce(function (steppointsOutput, trace) {

                var properties = trace.properties;
                var lines = trace.lines;

                // feature.coordinates => trace.lines
                trace.lines.reduce(function (steppointsOutput, points) {

                    // feature.coordinates.points => trace.lines.points
                    points.reduce(function (steppointsOutput, point) {

                        steppointsOutput.push({
                            stepId: stepId,
                            stepIndex: stepIndex++,
                            lineIndex: lineIndex,
                            latitude: point.latitude,
                            longitude: point.longitude,
                            elevation: point.elevation
                        });
                        return steppointsOutput;

                    }, steppointsOutput);

                    lineIndex++;

                    return steppointsOutput;

                }, steppointsOutput);

                console.log('lines %d - %d', trace.lines.length, lineIndex);

                return steppointsOutput;

            }, []);*/

        //    geojsonContent.features
            
            

            if (steppoints.length === 0) {
                console.log('Trace without any point');
                return res.send(400, 'Trace without any point');
            } else {
                console.log('Trace with %d point(s).', steppoints.length);
            }

            return exports._replacePoints(step, steppoints, req, res);

        }, function (err) {
            console.log(err);
            return res.send(400, err);
        }).done();

    });

};

exports._replacePoints = function (step, steppoints, req, res) {
    // replace existing steppoints

    return Steppoint.find({
        'stepId': step._id
    }).remove(function () {

        Steppoint.create(steppoints, function (err, lastStepPoint) {
            if (err) {
                console.log('Error creating steppoints: ' + err);
                return handleError(res, err);
            }

            // calculate total distance
            step.distance = geolib.getPathLength(steppoints);

            var elevationGain = steppoints.reduce(function (elevationGain, point) {

                if (point.elevation) {
                    if (elevationGain.lastElevation !== null) {
                        
                        var gain = point.elevation - elevationGain.lastElevation;

                        if (gain > 0) {
                            elevationGain.positive += gain;
                        } else {
                            elevationGain.negative += gain;
                        }
                    }
                    elevationGain.lastElevation = point.elevation;
                }

                return elevationGain;

            }, {
                lastElevation: null,
                positive: 0,
                negative: 0
            });

            if (elevationGain.lastElevation != null) {
                console.log('%d steppoints have been created (distance: %d, elevation gain: %d, %d).', steppoints.length, step.distance, elevationGain.positive, elevationGain.negative);
                step.positiveElevationGain = elevationGain.positive;
                step.negativeElevationGain = elevationGain.negative;
            } else {
                console.log('%d steppoints have been created (distance: %d).', steppoints.length, step.distance);
                step.positiveElevationGain = null;
                step.negativeElevationGain = null;
            }

            step.save(function (err) {
                if (err) {
                    console.log('Error updating step %s with new distance %d: %s.', step._id, step.distance, err);
                    return handleError(res, err);
                }
                return res.json(201);
            });

        });

    });
};

exports.updateByStep = function (req, res) {

    var stepId = req.params.stepId;
    var points = req.body.points;

    console.log(req);

    Step.findById(stepId, function (err, step) {

        if (err) {
            return handleError(res, err);
        }

        var stepIndex = 0;

        var steppoints = points.reduce(function (output, c) {

            var latitude = c.latitude;
            var longitude = c.longitude;
            var elevation = null;

            output.push({
                stepId: stepId,
                stepIndex: stepIndex++,
                lineIndex: 0,
                latitude: latitude,
                longitude: longitude,
                elevation: elevation
            });
            return output;
        }, []);

        return exports._replacePoints(step, steppoints, req, res);
    });
};


exports.getByStep = function (req, res) {

    var stepId = req.params.stepId;

    Steppoint.find({
        'stepId': stepId
    }).sort({
        'stepIndex': 1
    }).exec(function (err, steppoints) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, steppoints);
    });
};

exports.deleteByStep = function (req, res) {

    var stepId = req.params.stepId;

    Steppoint.find({
        'stepId': stepId
    }).remove(function (err) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200);
    });
};

// Updates an existing steppoint in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Steppoint.findById(req.params.id, function (err, steppoint) {
        if (err) {
            return handleError(res, err);
        }
        if (!steppoint) {
            return res.send(404);
        }
        var updated = _.merge(steppoint, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, steppoint);
        });
    });
};

// Deletes a steppoint from the DB.
exports.destroy = function (req, res) {
    Steppoint.findById(req.params.id, function (err, steppoint) {
        if (err) {
            return handleError(res, err);
        }
        if (!steppoint) {
            return res.send(404);
        }
        steppoint.remove(function (err) {
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