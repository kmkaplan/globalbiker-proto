'use strict';

var _ = require('lodash');
var Interest = require('./interest.model');
var Step = require('../step/step.model');

var io = require('../../components/io/io');
var path = require('path');
var fs = require('fs');
var geo = require('../../components/geo/geo');
var Q = require('q');

var ObjectId = require('mongoose').Types.ObjectId;


// Get list of interests
exports.index = function (req, res) {
    var searchCriteria = {};
    if (req.query.type) {
        searchCriteria.type = req.query.type;
    }

    Interest.find(searchCriteria).limit(500).exec(function (err, interests) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, interests);
    });
};

exports.findByStep = function (stepId) {
    var deffered = Q.defer();

    Interest.find({
        'stepId': stepId
    }).exec(function (err, interests) {
        if (err) {
            console.error(err);
            deffered.reject(err);
        }
        deffered.resolve(interests);
    });

    return deffered.promise;
};

exports.searchNearPoint = function (searchCriteria, types) {
    var deffered = Q.defer();

    var criteria = searchCriteria;

    if (types) {

        if (Object.prototype.toString.call(types) === '[object Array]') {
            criteria['$or'] = types.reduce(function (types, type) {
                types.push({
                    type: type
                });
                return types;
            }, []);

        } else {
            criteria.type = extraCriteria.types;
        }
    }

    // console.info('Search interests with criteria:', criteria);

    Interest.find(criteria).exec(function (err, interests) {
        if (err) {
            console.error(err);
            deffered.reject(err);
        }

        deffered.resolve(interests);
    });

    return deffered.promise;
};

exports.searchAroundStep = function (req, res) {

    var stepId = req.query.stepId;
    if (!stepId) {
        return res.send(400, 'Parameter stepId is missing');
    }

    var types = null;

    if (req.query.type) {
        types = req.query.type;
    }

    var distance;
    if (req.query.distance) {
        if (Object.prototype.toString.call(req.query.distance) === '[object Array]') {

            if (Object.prototype.toString.call(req.query.type) !== '[object Array]') {
                return res.send(400, 'Type should be an array.');
            }

            if (req.query.distance.length !== req.query.type.length) {
                return res.send(400, 'Type and distance arrays should have the same size (%d != %d)', req.query.distance.length, req.query.type.length);
            }
        }

        distance = req.query.distance;

    } else {
        distance = 200;
    }

    Step.findById(stepId).exec(function (err, step) {

        if (err) {
            return handleError(step, err);
        }

        // convert geometry to search criteria array

        var promises = [];

        if (step.geometry && step.geometry.coordinates && step.geometry.coordinates !== null) {

            if (Object.prototype.toString.call(distance) === '[object Array]') {
                // different distance depending of type of point

                var i = 0;

                var typesByDistance = distance.reduce(function (typesByDistance, d) {

                    if (typeof (typesByDistance[d]) === 'undefined') {
                        typesByDistance[d] = [];
                    }

                    var t = types[i++];

                    typesByDistance[d].push(t);

                    return typesByDistance;

                }, []);

                for (var d in typesByDistance) {
                    if (typesByDistance.hasOwnProperty(d)) {

                        var typesForDistance = typesByDistance[d];

                        console.info('Search interests for distance %d with %d types.', d, typesForDistance.length);

                        var criteriaArray = geo.geometryToNearCriterias(step.geometry, d);

                        // query database
                        promises = criteriaArray.reduce(function (promises, searchCriteria) {
                            var promise = exports.searchNearPoint(searchCriteria, typesForDistance);
                            promises.push(promise);
                            return promises;
                        }, promises);
                    }
                }

            } else {

                console.info('Search interests for distance %d.', distance);

                var criteriaArray = geo.geometryToNearCriterias(step.geometry, distance);

                // query database
                promises = criteriaArray.reduce(function (promises, searchCriteria) {
                    var promise = exports.searchNearPoint(searchCriteria, types);
                    promises.push(promise);
                    return promises;
                }, []);

            }

        }

        // add interests linked to this step
        promises.push(exports.findByStep(stepId));

        console.info('Synchronize %d promises.', promises.length);

        Q.all(promises).then(
            function (results) {

                var results = geo.filterDuplicated(results);

                return res.json(200, results);
            });

    });
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


        var extraCriteria = {};

        if (req.query.type) {
            extraCriteria.type = req.query.type;
        }

        var distance;
        if (req.query.distance) {
            distance = parseInt(req.query.distance);
        } else {
            distance = 200;
        }

        var criteriaArray = steps.reduce(function (criteriaArray, step) {

            // convert geometry to search criteria array
            return criteriaArray.concat(geo.geometryToNearCriterias(step.geometry, distance));

            return criteriaArray;
        }, []);

        // query database
        var promises = criteriaArray.reduce(function (promises, searchCriteria) {
            var promise = exports.searchNearPoint(searchCriteria, extraCriteria);
            promises.push(promise);
            return promises;
        }, []);

        Q.all(promises).then(
            function (results) {

                var results = geo.filterDuplicated(results);

                return res.json(200, results);
            });

    });
};

exports.searchAroundPoint = function (req, res) {

    if (!req.query.longitude) {
        return res.send(400, 'Parameter longitude is missing');
    }
    if (isNaN(req.query.longitude)) {
        return res.send(400, 'Parameter longitude is not valid');
    }
    if (!req.query.latitude) {
        return res.send(400, 'Parameter latitude is missing');
    }
    if (isNaN(req.query.latitude)) {
        return res.send(400, 'Parameter latitude is not valid');
    }

    var near = {
        $geometry: {
            type: "Point",
            coordinates: [parseFloat(req.query.longitude), parseFloat(req.query.latitude)]
        }
    };

    if (req.query.maxDistance && !isNaN(req.query.maxDistance)) {
        near.$maxDistance = parseInt(req.query.maxDistance);
    }

    var searchCriteria = {
        geometry: {
            $near: near
        }
    };

    if (req.query.priority) {
        searchCriteria.priority = parseInt(req.query.priority);
    }
    if (req.query.type) {
        searchCriteria.type = req.query.type;
    }

    Interest.find(searchCriteria).exec(function (err, interests) {
        if (err) {
            console.error(err);
            return handleError(res, err);
        }
        return res.json(200, interests);
    });
};


// Get a single interest
exports.show = function (req, res) {
    Interest.findById(req.params.id, function (err, interest) {

        if (err) {
            return handleError(res, err);
        }
        if (!interest) {
            return res.send(404);
        }
        return res.json(interest);
    });
};

/**
 * Get interests by step.
 */
exports.getByStep = function (req, res) {

    var stepId = req.params.stepId;

    Interest.find({
        'stepId': stepId
    }, function (err, interests) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, interests);
    });
};

/**
 * Get interests by tour.
 */
exports.getByTour = function (req, res) {

    var tourId = req.params.tourId;
    if (!tourId) {
        return res.send(400, 'Parameter tourId is missing');
    }

    Step.find({
        'tourId': new ObjectId(tourId)
    }).sort({
        '_id': 1
    }).exec(function (err, steps) {
        if (err) {
            return handleError(res, err);
        }

        var criteria = {};

        criteria['$or'] = steps.reduce(function (orCriterias, step) {
            orCriterias.push({
                stepId: step._id
            });
            return orCriterias;
        }, []);

        Interest.find(criteria, function (err, interests) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, interests);
        });
    });
};

exports.buildInterest = function (type, coordinates, properties, source) {

    if (!coordinates) {
        return null;
    }

    // convert coordinates
    var coordinates = geo.convertPointCoordinatesToWGS84(coordinates);

    var geometry = {
        type: type,
        coordinates: coordinates
    };

    var p = properties;

    var interest = {
        latitude: coordinates[1],
        longitude: coordinates[0],
        geometry: geometry,
        priority: 3,
        source: source
    };

    return interest;

}

// Creates a new bikelane in the DB.
exports.upload = function (req, res) {

    var interestType = req.params.type;
    if (!interestType) {
        console.error('Type is missing');
        return res.send(400, 'Type is missing');
    }

    var file = req.files.file;
    if (!file) {
        console.error('File "file" is missing.');
        return res.send(400, 'File "file" is missing.');
    }

    var fileName;
    switch (interestType) {
    case 'water-point':
        {
            fileName = 'fontaines_a_boire.json';
            break;
        }
    case 'velotoulouse':
        {
            fileName = 'Velo_Toulouse.json';
            break;
        }
    case 'wc':
        {
            fileName = 'Sanisette.json';
            break;
        }
    case 'merimee':
        {
            fileName = 'Base_Merimee.json';
            break;
        }
    case 'danger':
        {
            fileName = 'acc_carrefours_2008_2012.json';
            break;
        }
    default:
        {
            console.error('Invalid type "%s"', interestType);
            return res.send(400, 'Invalid type');
            break;
        }
    }

    if (file.originalname !== fileName) {
        console.error('Unexpected file name: "%s" instead of "%s".', file.originalname, fileName);
        return res.send(400, 'Unexpected file name: "' + fileName + '" expected.');
    }

    fs.readFile(file.path, 'utf8', function (err, data) {
        if (err) {
            console.log('Error reading file: ' + err);
            return res.send(500, err);
        }

        var geojsonContent = JSON.parse(data);

        var interests = geojsonContent.features.reduce(function (interests, currentFeature) {

            if (currentFeature.geometry === null) {
                return interests;
            }

            var interest = exports.buildInterest('Point', currentFeature.geometry.coordinates, currentFeature.properties, 'upload');

            if (interest === null) {
                return interests;
            }

            interest.type = interestType;

            switch (interestType) {
            case 'water-point':
                {
                    interest.name = currentFeature.properties['TYPE'],
                    interest.description = currentFeature.properties['LOCALISATION'];
                    break;

                }
            case 'velotoulouse':
                {
                    interest.name = currentFeature.properties['nom'];
                    interest.description = currentFeature.properties['num_station'];
                    break;
                }
            case 'wc':
                {
                    interest.name = currentFeature.properties['type'];
                    interest.description = currentFeature.properties['adresse'];
                    break;
                }
            case 'merimee':
                {
                    interest.name = currentFeature.properties['chpnoms'];
                    interest.description = currentFeature.properties['chpdesc'];
                    break;
                }
            case 'danger':
                {
                    interest.name = currentFeature.properties['nom_des_branches_du_carrefour'];
                    interest.description = currentFeature.properties['nom_des_branches_du_carrefour'];

                    var total = currentFeature.properties['total__2008_2012_'];

                    if (!total || parseInt(total) <= 2) {
                        return interests;
                    }

                    break;
                }
            }

            if (interest.name && interest.description) {
                interests.push(interest);
            } else {
                console.info('Name or description missing.');
            }

            return interests;

        }, []);

        // replace existing bikelanes

        Interest.find({
            type: interestType,
            source: 'upload'
        }).remove(function () {

            Interest.create(interests, function (err, interest) {
                if (err) {
                    console.log('Error creating interests: ' + err);
                    return handleError(res, err);
                }
                console.log('%d interests have been created.', interests.length);
                return res.json(201, interests);
            });

        });

    });
};


exports.deletePhoto = function (req, res) {


    var interestId = req.params.id;
    var photoId = req.param("photoId");

    Interest.findById(interestId, function (err, interest) {
        if (err) {
            return handleError(res, err);
        }
        if (!interest) {
            console.log('Interest "%s" does not exists.', interestId);
            return res.send(404);
        }

        var photoToDelete = interest.photos.reduce(function (output, photo) {
            if (("" + photo._id) === photoId) {
                return photo;
            } else {
                console.log(photo._id);
                console.log(typeof (photo._id));
                console.log(typeof (photoId));
            }
            return output;
        }, null);

        if (photoToDelete === null) {
            console.log('Photo "%s" does not exists.', photoId);
            return res.send(404);
        }

        var index = interest.photos.indexOf(photoToDelete);
        if (index > -1) {
            interest.photos.splice(index, 1);
            interest.save(function (err) {
                if (err) {
                    return handleError(res, err);
                }
                io.removeFile(photoToDelete.url, function (err) {
                    return res.json(204, interest);
                });

            });
        }

    });


};

// Creates a new interest in the DB.
exports.create = function (req, res) {

    Interest.create(req.body, function (err, interest) {
        if (err) {
            console.error(err);
            return handleError(res, err);
        }
        return res.json(201, interest);
    });
};

var mergeObjects = function (input, output) {
    for (var key in input) {
        if (input.hasOwnProperty(key)) {

            var value = input[key];

            if (Object.prototype.toString.call(value) === '[object Array]') {
                // value is an array
                console.log(value.slice(0));
                output[key] = value.slice(0);
                console.log(output[key]);

            } else {
                // single property
                output[key] = value;
            }

        }
    }
}

// Updates an existing interest in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Interest.findById(req.params.id, function (err, interest) {
        if (err) {
            return handleError(res, err);
        }
        if (!interest) {
            return res.send(404);
        }

        console.log(req.body);

        // console.log(deepCopy(req.body));


        mergeObjects(req.body, interest);

        interest.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, interest);
        });
    });
};

// Deletes a interest from the DB.
exports.destroy = function (req, res) {
    Interest.findById(req.params.id, function (err, interest) {
        if (err) {
            return handleError(res, err);
        }
        if (!interest) {
            return res.send(404);
        }
        interest.remove(function (err) {
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