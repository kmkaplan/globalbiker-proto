'use strict';

var _ = require('lodash');
var Photo = require('./photo.model');
var geo = require('../../components/geo/geo');
var Step = require('../step/step.model');
var PhotoService = require('./photo.service');
var Q = require('q');
var ObjectId = require('mongoose').Types.ObjectId;
var io = require('../../components/io/io');
var path = require('path');

// Get list of photos
exports.index = function (req, res) {
    Photo.find(function (err, photos) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, photos);
    });
};

exports.searchNearPoint = function (searchCriteria) {
    var deffered = Q.defer();

    if (searchCriteria !== null) {

        Photo.find(searchCriteria).exec(function (err, results) {
            if (err) {
                console.error(err);
                deffered.reject(err);
            }

            deffered.resolve(results);
        });

    } else {
        console.warn('Invalid criteria.');
        deffered.resolve([]);
    }

    return deffered.promise;
};

exports.searchAroundTour = function (req, res) {

    if (!req.query.tourId) {
        return res.send(400, 'Parameter tourId is missing');
    }

    var tourId = req.query.tourId;
    Step.find({
        'tourId': new ObjectId(tourId)
    }).sort({
        '_id': 1
    }).exec(function (err, steps) {
        if (err) {
            return handleError(res, err);
        }

        var distance;
        if (req.query.distance) {
            distance = parseInt(req.query.distance);
        } else {
            distance = 200;
        }

        var criteriaArray = steps.reduce(function (criteriaArray, step) {

            var c = geo.geometryToNearCriterias(step.geometry, distance);

            if (c !== null) {
                // convert geometry to search criteria array
                return criteriaArray.concat(c);
            } else {
                return criteriaArray;
            }

        }, []);

        console.log('Nb of criteria: %d for distance %d', criteriaArray.length, distance);

        // query database
        var promises = criteriaArray.reduce(function (promises, searchCriteria) {

            if (searchCriteria !== null) {
                var promise = exports.searchNearPoint(searchCriteria);
                promises.push(promise);
            }
            return promises;
        }, []);

        Q.all(promises).then(
            function (results) {

                var results = geo.filterDuplicated(results);

                return res.json(200, results);
            });

    });
};

exports.searchAroundStep = function (req, res) {

    if (!req.query.stepId) {
        return res.send(400, 'Parameter stepId is missing');
    }

    var stepId = req.query.stepId;
    Step.findById(stepId, function (err, step) {
        if (err) {
            console.error(err);
            return handleError(res, err);
        }

        var distance;
        if (req.query.distance) {
            distance = parseInt(req.query.distance);
        } else {
            distance = 200;
        }

        var criteriaArray = geo.geometryToNearCriterias(step.geometry, distance);

        console.log('Nb of criteria: %d for distance %d', criteriaArray.length, distance);

        // query database
        var promises = criteriaArray.reduce(function (promises, searchCriteria) {

            if (searchCriteria !== null) {
                var promise = exports.searchNearPoint(searchCriteria);
                promises.push(promise);
            }
            return promises;
        }, []);

        Q.all(promises).then(
            function (results) {

                var results = geo.filterDuplicated(results);

                return res.json(200, results);
            });

    });
};

// Get a single photo
exports.show = function (req, res) {
    Photo.findById(req.params.id, function (err, photo) {
        if (err) {
            return handleError(res, err);
        }
        if (!photo) {
            return res.send(404);
        }
        return res.json(photo);
    });
};

// Creates a new photo in the DB.
exports.create = function (req, res) {

    var file = req.file;

    if (!file) {
        console.log('File "file" is missing.');
        return res.send(400, 'File "file" is missing.');
    }

    PhotoService.createPhoto(file, req.user._id).then(function (photo) {
        return res.json(201, photo);
    }, function (err) {
        return handleError(res, err);
    });

};

// Updates an existing photo in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Photo.findById(req.params.id, function (err, photo) {
        if (err) {
            return handleError(res, err);
        }
        if (!photo) {
            return res.send(404);
        }
        var updated = _.merge(photo, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, photo);
        });
    });
};

// Deletes a photo from the DB.
exports.destroy = function (req, res) {
    Photo.findById(req.params.id, function (err, photo) {
        if (err) {
            return handleError(res, err);
        }
        if (!photo) {
            return res.send(404);
        }
        photo.remove(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    console.error(err);
    return res.send(500, err);
}


exports.createThumbnail = function (photo, maxWidth, maxHeight) {
    var deferred = Q.defer();

    if (!photo.thumbnails) {
        photo.thumbnails = {};
    }

    var thumbnailReference = 'w' + maxWidth + 'h' + maxHeight;

    var photoPath = path.resolve(__dirname, '../..' + photo.url);

    var suffix = '-' + maxWidth + '-' + maxHeight;

    var thumbnailHttpPath = io.addPathSuffixBeforeFileExtension(photoPath, suffix);

    photo.thumbnails[thumbnailReference] = io.addPathSuffixBeforeFileExtension(photo.url, suffix);;

    io.createThumbnail(photoPath, thumbnailHttpPath, maxWidth, maxHeight).then(function () {

        deferred.resolve(photo);

    }, function (err) {
        deferred.reject(err);

    });

    return deferred.promise;
}

exports.upload = function (req, res) {

    var file = req.files.file;

    if (!file) {
        console.log('File "file" is missing.');
        return res.send(400, 'File "file" is missing.');
    }

    var geometry = req.body.geometry;

    if (!geometry) {
        console.log('Geometry is missing.');
        return res.send(400, 'Geometry is missing.');
    } else {
        geometry = JSON.parse(geometry);
    }

    var newUrl = '/photos/' + path.basename(file.path);
    var newPath = 'server' + newUrl;

    // copy file
    io.copyFile(file.path, newPath).then(function () {

        var photo = {
            url: newUrl,
            geometry: geometry
        };

        console.info('File copied.');

        exports.createThumbnail(photo, 600, 400).then(function () {

            console.info('Thumbnail created.');

            Photo.create(photo, function (err, photo) {
                if (err) {
                    console.error(err);
                    return handleError(res, err);
                }
                console.info('Photo created.');
                return res.json(201, photo);
            });


        }, function (err) {
            return handleError(res, err);
        }).done();

    })
};