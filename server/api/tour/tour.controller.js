'use strict';

var _ = require('lodash');
var Tour = require('./tour.model');
var Step = require('../step/step.model');
var Region = require('../region/region.model');
var stepController = require('../step/step.controller');
var auth = require('../../auth/auth.service');
var referenceCreator = require('../../components/string/reference.creator');
var config = require('../../config/environment');
var geo = require('../../components/geo/geo');
var jsonpatch = require('fast-json-patch');
var ObjectId = require('mongoose').Types.ObjectId;

var Q = require('q');

// Get list of tours
exports.indexAnonymous = function (req, res) {

    var criteria = {
        status: 'validated'
    };

    Tour.find(criteria).sort({
        'votes': -1,
        '_id': -1
    }).populate('authors').exec(function (err, tours) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, tours);
    });

};

function isAdmin(req) {
    return req.user && req.user._id && config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf('admin');
}

// Get list of tours
exports.indexConnected = function (req, res) {

    var criteria = {};

    if (isAdmin(req)) {
        console.log('Roles:', req.user.role);
    } else {
        criteria.status = 'validated';
    }

    Tour.find(criteria).populate('authors').exec(function (err, tours) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, tours);
    });

};

exports.uploadTrace = function (req, res) {

    var tourReference = req.params.reference;

    Tour.findOne({
        reference: tourReference
    }).exec(function (err, tour) {
        if (err) {
            return handleError(res, err);
        }
        if (!tour) {
            console.log('Tour reference "%s" does not exists.', tourReference);
            return res.send(404);
        }
        var file = req.files.file;

        if (!file) {
            console.log('File "file" is missing.');
            return res.send(400, 'File "file" is missing.');
        }

        geo.readTracesFromFile(file, true).then(function (features) {

                var feature;

                if (features.length === 0) {
                    console.log('Trace without any feature.');
                    return res.send(400, 'Trace without any point');
                } else if (features.length > 1) {
                    console.error('Trace with %d features(s). Should never append due to readTracesFromFile second parameter.', features.length);
                }

                feature = features[0];

                // update tour geometry
                tour.geometry = {
                    coordinates: feature.xyzCoordinates.xy, //[[[0.951528735, 44.182434697], [0.951036299, 44.182579117]]],
                    type: feature.geometry.type
                };

                tour.sourceGeometry = tour.geometry;

                // tour.elevationPoints = feature.xyzCoordinates.z;

                // tour.distance = geo.getTotalDistanceFromGeometry(tour.geometry);

                /*  var elevationGain = geo.getElevationGain(feature.geometry.type, tour.elevationPoints);

                        if (elevationGain.lastElevation != null) {
                            console.log('Trace has been uploaded (distance: %d, elevation gain: %d, %d).', tour.distance, elevationGain.positive, elevationGain.negative);
                            tour.positiveElevationGain = elevationGain.positive;
                            tour.negativeElevationGain = elevationGain.negative;
                        } else {
                            console.log('Trace has been uploaded (distance: %d).', tour.distance);
                            tour.positiveElevationGain = null;
                            tour.negativeElevationGain = null;
                        }*/

                tour.save(function (err) {
                    if (err) {
                        console.error(err);
                        return handleError(res, err);
                    }
                    return res.json(200, tour);
                });
            },
            function (err) {
                console.log(err);
                return res.send(400, err);
            }).done();
    });

};


// Get a single tour
exports.show = function (req, res) {
    Tour.findById(req.params.id).populate('authors').populate('region').exec(function (err, tour) {
        if (err) {
            return handleError(res, err);
        }
        if (!tour) {
            return res.send(404);
        }
        return res.json(tour);
    });
};

exports.getByReference = function (req, res) {
    Tour.findOne({
        reference: req.params.reference
    }).populate('authors').populate('region').exec(function (err, tour) {
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

    var newTour = req.body;

    // calculate reference (juste once, at creation time)
    newTour.reference = referenceCreator.createReferenceFromString(newTour.title + '-' + Math.floor((Math.random() * 1000) + 1));

    // set author
    newTour.authors = [req.user._id];

    Tour.create(newTour, function (err, tour) {
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
    var params = {
        _id: new ObjectId(req.params.id)
    };
    if (!isAdmin(req)) {
        // check that current user is one of the authors
        params.authors = req.user._id;
    }
    Tour.findOne(params).exec(function (err, tour) {

        if (err) {
            return handleError(res, err);
        }
        if (!tour) {
            return res.send(404);
        }

        var patches = req.body.patches;
        jsonpatch.apply(tour, patches);

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