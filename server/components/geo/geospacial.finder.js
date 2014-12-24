'use strict';

var Q = require('q');
var fs = require('fs');
var DOMParser = require('xmldom').DOMParser;
var togeojson = require('togeojson');
var tcx = require('tcx');
var S = require('string');
var proj4 = require('proj4');
var geolib = require('geolib');
var simplify = require('simplify-js');
var geojsonTools = require('geojson-tools');

exports.find = function (schema, geometry, maxDistance) {
    var deffered = Q.defer();

    // transform geometry to list of points depending of maxDistance
    var pointsCoordinates = exports.geometryToPoints(geometry, maxDistance);

    // find all points in the area
    exports.findNearPoints(schema, pointsCoordinates, maxDistance).then(
        function (resultsByPoint) {

            // filter duplicated
            var entities = {};

            var i = 0;

            var resultsWithDistance = resultsByPoint.reduce(function (resultsWithDistance, resultsForPoint) {

                return resultsForPoint.reduce(function (resultsWithDistance, result) {

                    var entity = result.obj;

                    if (typeof (entities[entity._id]) === 'undefined') {
                        entities[entity._id] = entity;
                        entity.distance = result.dis
                        resultsWithDistance.push(entity);
                    } else {
                        if (entities[entity._id].distance > result.dis) {
                            // update distance to minimal one
                            console.warn('Update distance %d to minimal one %d', entities[entity._id].distance, result.dis);
                            entities[entity._id].distance = result.dis;
                        }
                        i++;
                    }

                    return resultsWithDistance;

                }, resultsWithDistance);

            }, []);


            console.log('%d results (%d duplicated have been removed)', resultsWithDistance.length, i);
            deffered.resolve(resultsWithDistance);
        }, function (err) {
            deffered.reject(err);
        }
    ).done();

    return deffered.promise;
}

exports.findNearPoints = function (schema, pointsCoordinates, maxDistance) {

    var promises = pointsCoordinates.reduce(function (promises, pointCoordinates) {

        promises.push(exports.findNearPoint(schema, pointCoordinates, maxDistance));
        return promises;
    }, []);

    return Q.all(promises);
}


exports.findNearPoint = function (schema, pointCoordinates, maxDistance) {
    var deffered = Q.defer();

    schema.geoNear({
            "type": 'Point',
            "coordinates": pointCoordinates
        }, {
            lean: true,
            spherical: true,
            includeLocs: true,
            maxDistance: maxDistance / 6378137,
            distanceMultiplier: 6378137,
            limit: 100,
            query: {
                type: {
                    $ne: 'merimee'
                }
            }
        },
        function (err, results, stats) {
            if (err) {
                console.log(err);
                deffered.reject(err);
            }

            //console.log('Stats: ', stats);
            //console.log('Number of results: ' + results.length);

            deffered.resolve(results);
        });

    return deffered.promise;
}

exports.coordinatesToPoints = function (coordinates, distance) {

    if (coordinates.length === 0) {
        return [];
    }

    distance = parseInt(distance);

    var points = geojsonTools.complexify(coordinates, distance / 1000);

    console.info('Complexify coordinates from %d to %d, ratio: %d.', coordinates.length, points.length, coordinates.length / points.length);

    return points;
};

exports.geometryToPoints = function (geometry, distance) {

    distance = parseInt(distance);

    if (geometry && geometry.coordinates) {
        var points;
        if (geometry.type === 'LineString') {
            console.log('LineString');
            points = exports.coordinatesToPoints(geometry.coordinates, distance);
        } else if (geometry.type === 'MultiLineString') {
            console.log('MultiLineString');

            points = geometry.coordinates.reduce(function (points, coordinates) {
                return points.concat(exports.coordinatesToPoints(coordinates, distance));
            }, []);

        } else {
            console.log('Unexpected feature geometry type "%s".', geometry.type);
            return null;
        }
        return points;
    } else {
        console.log('geometryToPoints: Invalid geometry.', geometry);
        return [];
    }
}

exports.concatenateGeometries = function (geometries) {
    var coordinatesArray = geometries.reduce(function (coordinatesArray, geometry) {
        if (geometry !== null && geometry.coordinates && geometry.coordinates.length > 0) {
            if (geometry.type == 'LineString') {
                coordinatesArray.push(geometry.coordinates);
            } else if (geometry.type == 'MultiLineString') {
                coordinatesArray = coordinatesArray.concat(geometry.coordinates);
            } else {
                console.error('Geometry type "%s" not supported.', geometry.type);
            }
        }

        return coordinatesArray;

    }, []);

    return {
        type: 'MultiLineString',
        coordinates: coordinatesArray
    };
};