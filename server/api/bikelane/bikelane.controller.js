'use strict';

var fs = require('fs');
var _ = require('lodash');
var Bikelane = require('./bikelane.model');

// Get list of bikelanes
exports.index = function (req, res) {
    Bikelane.find(function (err, bikelanes) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, bikelanes);
    });
};

// Get a single bikelane
exports.show = function (req, res) {
    Bikelane.findById(req.params.id, function (err, bikelane) {
        if (err) {
            return handleError(res, err);
        }
        if (!bikelane) {
            return res.send(404);
        }
        return res.json(bikelane);
    });
};

// Creates a new bikelane in the DB.
exports.create = function (req, res) {
    Bikelane.create(req.body, function (err, bikelane) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, bikelane);
    });
};

exports.buildBikelane = function (properties, coordinates) {
    var points = coordinates.reduce(function (pointsOutput, c) {

        var latitude = c[1];
        var longitude = c[0];

        pointsOutput.push({
            latitude: latitude,
            longitude: longitude
        });
        return pointsOutput;

    }, []);

    var p = properties;

    var bikelane = {
        name: p['Nom_voie'],
        type: p['obs_type'],
        surface: p['Revetement'],
        inseeCode: p['code_insee'],
        points: points
    };

    return bikelane;

}
// Creates a new bikelane in the DB.
exports.upload = function (req, res) {

    /*   console.log(req.body)
    console.log(req.files)*/

    var file = req.files.file;

    if (!file) {
        console.log('File "file" is missing.');
        return res.send(400, 'File "file" is missing.');
    }

    if (file.originalname !== 'Pistes_Cyclables.json') {
        console.log('Unexpected file name: "%s" instead of "Pistes_Cyclables.json".', file.originalname);
        return res.send(400, 'Unexpected file name. "Pistes_Cyclables.json" expected.');
    }

    fs.readFile(file.path, 'utf8', function (err, data) {
        if (err) {
            console.log('Error reading file: ' + err);
            return res.send(500, err);
        }

        var geojsonContent = JSON.parse(data);

        var bikelanes = geojsonContent.features.reduce(function (bikelanesOutput, currentFeature) {

            if (currentFeature.geometry.type === 'LineString') {

                var bikelane = exports.buildBikelane(currentFeature.properties, currentFeature.geometry.coordinates);

                bikelanesOutput.push(bikelane);

            } else if (currentFeature.geometry.type === 'MultiLineString') {
                // split MultiLineString bikelane in several LineString bikelanes
                for (var i = 0; i < currentFeature.geometry.coordinates.length; i++) {
                    var coordinates = currentFeature.geometry.coordinates[i];
                    var bikelane = exports.buildBikelane(currentFeature.properties, coordinates);

                    bikelanesOutput.push(bikelane);
                }

            } else {
                console.log('Unexpected feature geometry type "%s".', currentFeature.geometry.type);
            }

            return bikelanesOutput;

        }, []);

        // replace existing bikelanes

        Bikelane.find({}).remove(function () {

            Bikelane.create(bikelanes, function (err, bikelane) {
                if (err) {
                    console.log('Error creating bikelanes: ' + err);
                    return handleError(res, err);
                }
                console.log('%d bikelane have been created.', bikelanes.length);
                return res.json(201, bikelane);
            });

        });

    });
};

// Updates an existing bikelane in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Bikelane.findById(req.params.id, function (err, bikelane) {
        if (err) {
            return handleError(res, err);
        }
        if (!bikelane) {
            return res.send(404);
        }
        var updated = _.merge(bikelane, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, bikelane);
        });
    });
};

// Deletes a bikelane from the DB.
exports.destroy = function (req, res) {
    Bikelane.findById(req.params.id, function (err, bikelane) {
        if (err) {
            return handleError(res, err);
        }
        if (!bikelane) {
            return res.send(404);
        }
        bikelane.remove(function (err) {
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