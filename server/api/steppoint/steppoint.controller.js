'use strict';

var _ = require('lodash');
var Steppoint = require('./steppoint.model');
var gpsUtil = require('gps-util');
var Step = require('../step/step.model');
var togeojson = require('togeojson'),
    fs = require('fs');

var DOMParser = require('xmldom').DOMParser;


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

    /* console.log(req.body)
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

        fs.readFile(file.path, 'utf8', function (err, data) {
            if (err) {
                console.log('Error reading file: ' + err);
                return res.send(500, err);
            }

            var dom = (new DOMParser()).parseFromString(data, 'text/xml');

            var geojsonContent = togeojson.gpx(dom);

            if (geojsonContent.features.length !== 1) {
                console.log('Unexpected number of feautres in GPS trace: %d.', geojsonContent.features.length);
                return res.send(400, 'Unexpected number of feautres in GPS trace.');
            }

            var coordinates = geojsonContent.features[0].geometry.coordinates;

            var stepIndex = 0;

            var steppoints = coordinates.reduce(function (output, c) {

                var latitude = c[1];
                var longitude = c[0];
                var elevation = c[2];

                output.push({
                    stepId: stepId,
                    stepIndex: stepIndex++,
                    latitude: latitude,
                    longitude: longitude,
                    elevation: elevation
                });
                return output;
            }, []);


            return exports._replacePoints(step, steppoints, req, res);

        });
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
            console.log('%d steppoints have been created.', steppoints.length);

            // calculate total distance

            var pointsForGeodist = steppoints.reduce(function (output, sp) {

                output.push({
                    lat: sp.latitude,
                    lng: sp.longitude
                });
                return output;
            }, []);

            step.distance = gpsUtil.getTotalDistance(pointsForGeodist);

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