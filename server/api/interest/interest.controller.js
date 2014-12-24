'use strict';

var _ = require('lodash');
var Interest = require('./interest.model');
var Step = require('../step/step.model');

var io = require('../../components/io/io');
var path = require('path');
var fs = require('fs');
var geo = require('../../components/geo/geo');
var geospacialFinder = require('../../components/geo/geospacial.finder');
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

exports._getStepPromisesSearchAroundStep = function (step, distance, types) {

    var stepId = step._id;

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

    return promises;
}

exports.getByStep = function (req, res) {

    var stepId = req.params.stepId;
    if (!stepId) {
        return res.send(400, 'Parameter stepId is missing');
    }

    Step.findById(stepId).exec(function (err, step) {

        if (err) {
            return handleError(step, err);
        }

        var maxDistance = 1000;

        if (step.geometry) {

            geospacialFinder.find(Interest, step.geometry, maxDistance).then(
                function (interests) {
                    return res.status(200).json(interests)
                }, function (err) {
                    console.log(err);
                    return handleError(res, err);
                }).done();

        } else {
            Interest.find({
                'stepId': stepId
            }, function (err, interests) {
                if (err) {
                    return handleError(res, err);
                }
                return res.json(200, interests);
            });
        }

    });

}

exports.filterInterestsByDistanceByType = function (interests, distanceByType) {
    // filter
    var filtered = interests.reduce(function (interests, interest) {

        var d = distanceByType[interest.type];

        if (d) {
            if (interest.distance <= d) {
                interests.push(interest);
            } else {
                console.warn('Type %s filtered off by distance (%d > %d).', interest.type, d, interest.distance);
            }
        } else {
            console.warn('Type %s filtered off.', interest.type);
        }

        return interests;

    }, []);

    return filtered;
}

exports.initSearchAroundParams = function (req, res) {
    var types = null;

    if (req.query.type) {
        types = req.query.type;
    }

    var distanceByType = {};
    var maxDistance;
    if (req.query.distance) {

        if (Object.prototype.toString.call(req.query.distance) === '[object Array]') {

            if (Object.prototype.toString.call(req.query.type) !== '[object Array]') {
                return res.send(400, 'Type should be an array.');
            }

            if (req.query.distance.length !== req.query.type.length) {
                return res.send(400, 'Type and distance arrays should have the same size (%d != %d)', req.query.distance.length, req.query.type.length);
            }

            var i = 0;
            maxDistance = req.query.distance.reduce(function (maxDistance, d) {

                var type = types[i++];

                distanceByType[type] = d;

                if (d > maxDistance) {
                    maxDistance = d;
                }
                return maxDistance;

            }, 0);

        } else {
            maxDistance = req.query.distance;
            distanceByType[types] = maxDistance;
        }

    } else {
        maxDistance = 200;
        distanceByType[type] = 200;
    }

    console.log('distanceByType: ', distanceByType);

    return {
        maxDistance: maxDistance,
        distanceByType: distanceByType
    };
}

exports.searchAroundStep = function (req, res) {

    var stepId = req.query.stepId;
    if (!stepId) {
        return res.send(400, 'Parameter stepId is missing');
    }

    var params = exports.initSearchAroundParams(req, res);

    var maxDistance = params.maxDistance;
    var distanceByType = params.distanceByType;

    Step.findById(stepId).exec(function (err, step) {

        if (err) {
            return handleError(step, err);
        }

        if (step.geometry) {

            geospacialFinder.find(Interest, step.geometry, maxDistance).then(
                function (interests) {

                    // filter
                    var filtered = exports.filterInterestsByDistanceByType(interests, distanceByType);

                    console.info('Filtered results: %d / %d', filtered.length, interests.length);

                    return res.status(200).json(filtered)
                }, function (err) {
                    console.log(err);
                    return handleError(res, err);
                }).done();

        } else {
            Interest.find({
                'stepId': stepId
            }, function (err, interests) {
                if (err) {
                    return handleError(res, err);
                }
                return res.json(200, interests);
            });
        }

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

exports.searchAroundTour = function (req, res) {

    var tourId = req.query.tourId;
    if (!tourId) {
        return res.send(400, 'Parameter tourId is missing');
    }

    var params = exports.initSearchAroundParams(req, res);

    var maxDistance = params.maxDistance;
    var distanceByType = params.distanceByType;

    Step.find({
        'tourId': new ObjectId(tourId)
    }).sort({
        '_id': 1
    }).exec(function (err, steps) {
        if (err) {
            return handleError(res, err);
        }

        var geometries = steps.reduce(function (geometries, step) {
            if (step.geometry) {
                geometries.push(step.geometry);
            }
            return geometries;
        }, []);

        var tourGeometry = geospacialFinder.concatenateGeometries(geometries);

        geospacialFinder.find(Interest, tourGeometry, maxDistance).then(
            function (interests) {

                // filter
                var filtered = exports.filterInterestsByDistanceByType(interests, distanceByType);

                console.info('Filtered results: %d / %d', filtered.length, interests.length);

                return res.status(200).json(filtered)
            }, function (err) {
                console.log(err);
                return handleError(res, err);
            }).done();

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