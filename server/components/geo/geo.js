'use strict';

var Q = require('q');
var fs = require('fs');
var DOMParser = require('xmldom').DOMParser;
var togeojson = require('togeojson');
var tcx = require('tcx');
var S = require('string');
var proj4 = require('proj4');
var geolib = require('geolib');

exports.projections = {
    'EPSG:3943': '+proj=lcc +lat_1=42.25 +lat_2=43.75 +lat_0=43 +lon_0=3 +x_0=1700000 +y_0=2200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
};

exports.getTotalDistanceFromGeometry = function (geometry) {
    var distance;
    if (geometry.type === 'LineString') {
        distance = geolib.getPathLength(geometry.coordinates);
    } else if (geometry.type === 'MultiLineString') {
        distance = geometry.coordinates.reduce(function (distance, coordinates) {
            distance += geolib.getPathLength(coordinates);
            return distance;
        }, 0);
    } else {
        console.error('Geometry type "%s" not supported.', geometry.type);
        return null;
    }
    return distance;
};

exports.getElevationGain = function (type, elevationPoints) {

    var elevationGain = {
        lastElevation: null,
        positive: 0,
        negative: 0
    };

    if (type === 'LineString') {
        // single array
        elevationGain = exports.sumElevationGainFromElevationArray(elevationGain, elevationPoints);
    } else if (type === 'MultiLineString') {
        // array of array
        elevationGain = elevationPoints.reduce(function (elevationGain, elevationPoints) {
            elevationGain = exports.sumElevationGainFromElevationArray(elevationGain, elevationPoints);
            return elevationGain;
        }, elevationGain);

    } else {
        console.error('Geometry type "%s" not supported.', type);
        return null;
    }


    return elevationGain;
};

exports.sumElevationGainFromElevationArray = function (elevationGain, elevationPoints) {

    if (elevationPoints && elevationPoints.length !== 0) {

        elevationGain = elevationPoints.reduce(function (elevationGain, elevationPoint) {

            if (elevationPoint) {
                if (elevationGain.lastElevation !== null) {

                    var gain = elevationPoint - elevationGain.lastElevation;

                    if (gain > 0) {
                        elevationGain.positive += gain;
                    } else {
                        elevationGain.negative += gain;
                    }
                    console.log('%s *** %s *** %s', elevationPoint, elevationGain.lastElevation, gain);
                }
                elevationGain.lastElevation = elevationPoint;


            }

            return elevationGain;

        }, elevationGain);
    }

    return elevationGain;
};

/* convert 'EPSG:3943' coordinates to WGS84 */
exports.convertPointCoordinatesToWGS84 = function (pointCoordinates) {

    var converter = proj4(exports.projections['EPSG:3943']);

    var transformed = converter.inverse(pointCoordinates);

    return transformed;
};

/* convert 'EPSG:3943' coordinates to WGS84 */
exports.convertCoordinatesToWGS84 = function (coordinates) {

    var converter = proj4(exports.projections['EPSG:3943']);

    var convertedPoints = coordinates.reduce(function (output, p) {

        var transformed = converter.inverse(p);

        output.push(transformed);

        return output;

    }, []);
    return convertedPoints;
};

exports.buildLine = function (coordinates) {

    var line = coordinates.reduce(function (pointsOutput, c) {

        var latitude = c[1];
        var longitude = c[0];
        var elevation = c[2];

        pointsOutput.push({
            latitude: latitude,
            longitude: longitude,
            elevation: elevation
        });
        return pointsOutput;

    }, []);

    return line;

}

exports.readTracesFromFile = function (file) {

    var deffered = Q.defer();

    fs.readFile(file.path, 'utf8', function (err, data) {
        if (err) {
            console.log(err);
            return deffered.reject(err);
        }

        var dom = (new DOMParser()).parseFromString(data, 'text/xml');

        var geojsonContent;

        var fileName = S(file.originalname);

        if (fileName.endsWith('.tcx')) {
            geojsonContent = tcx(dom);
        } else if (fileName.endsWith('.gpx')) {
            geojsonContent = togeojson.gpx(dom);
        } else {
            console.log('Unsuported extension for file "%s".', file.originalName);
            return deffered.reject('Unsuported file extension.');
        }



        var features = geojsonContent.features.reduce(function (features, feature) {

            if (feature.geometry.type === 'LineString') {
                // single line
                // convert coordinates
                if (feature.geometry.coordinates.length < 2) {
                    console.log('Line with only %d points: will be ignored.', feature.geometry.coordinates.length);
                    return features;
                }
                feature.xyzCoordinates = feature.geometry.coordinates.reduce(function (xyzCoordinates, point) {
                    xyzCoordinates.xy.push([point[0], point[1]]);
                    if (point.length > 2) {
                        // add elevation
                        xyzCoordinates.z.push(point[2]);
                    }
                    return xyzCoordinates;
                }, {
                    xy: [],
                    z: []
                });


            } else if (feature.geometry.type === 'MultiLineString') {
                // multiple lines
                feature.xyzCoordinates = feature.geometry.coordinates.reduce(function (xyzCoordinates, coordinates) {

                    if (coordinates.length < 2) {
                        console.log('Line with only %d points: will be ignored.', coordinates.length);
                        return xyzCoordinates;
                    }

                    var subXYZCoordinates = coordinates.reduce(function (xyzCoordinates, point) {

                        xyzCoordinates.xy.push([point[0], point[1]]);
                        if (point.length > 2) {
                            // add elevation
                            xyzCoordinates.z.push(point[2]);
                        }
                        return xyzCoordinates;
                    }, {
                        xy: [],
                        z: []
                    });

                    xyzCoordinates.xy.push(subXYZCoordinates.xy);
                    if (subXYZCoordinates.z.length !== 0) {
                        // add elevation
                        xyzCoordinates.z.push(subXYZCoordinates.z);
                    }
                    return xyzCoordinates;
                }, {
                    xy: [],
                    z: []
                });


            } else {
                console.log('Unexpected feature geometry type "%s".', feature.geometry.type);
                return features;
            }

            features.push(feature);

            return features;

        }, []);

        console.log('%d feature(s) have been read.', features.length);

        deffered.resolve(features);

    });
    return deffered.promise;
};