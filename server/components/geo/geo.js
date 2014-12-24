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

exports.projections = {
    'EPSG:3943': '+proj=lcc +lat_1=42.25 +lat_2=43.75 +lat_0=43 +lon_0=3 +x_0=1700000 +y_0=2200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
};

exports.inverseLatLng = function (array) {
    return array.reduce(function (output, item) {
        output.push([item[1], item[0]]);
        return output;
    }, []);
};

exports.simplify = function (geometry, tolerance, highQuality) {
    if (geometry !== null) {
        if (geometry.type == 'LineString') {
            return simplify(geometry.coordinates, tolerance, highQuality);
        } else if (geometry.type == 'MultiLineString') {
            return geometry.coordinates.reduce(function (coordinatesArray, coordinates) {
                coordinatesArray.push(simplify(coordinates, tolerance, highQuality));
                return coordinatesArray;
            }, []);
        } else {
            console.error('Geometry type "%s" not supported.', geometry.type);
            return null;
        }
    }
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
2
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

exports.coordinatesToNearCriterias = function (coordinates, distance) {

    if (coordinates.length === 0) {
        return [];
    }

    distance = parseInt(distance);

    var simplifiedCoordinates = coordinates; //geo.simplify(coordinates, 0.1, false)

    var points = geojsonTools.complexify(simplifiedCoordinates, distance / 1000);

    console.info('Simplify from %d to %d then complexify  instead of %d, ratio: %d.', coordinates.length, simplifiedCoordinates.length, points.length, simplifiedCoordinates.length / points.length);

    var nearCriterias = points.reduce(function (nearCriterias, point) {
        var criteria = {
            geometry: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: point
                    },
                    $maxDistance: distance
                }
            }
        };

        nearCriterias.push(criteria);

        return nearCriterias;
    }, []);

    return nearCriterias;
};

exports.geometryToNearCriterias = function (geometry, distance) {

    distance = parseInt(distance);

    if (geometry && geometry.coordinates) {
        var nearCriterias;
        if (geometry.type === 'LineString') {
            console.log('LineString');
            nearCriterias = exports.coordinatesToNearCriterias(geometry.coordinates, distance);
        } else if (geometry.type === 'MultiLineString') {
            console.log('MultiLineString');

            nearCriterias = geometry.coordinates.reduce(function (nearCriterias, coordinates) {
                var criteriaArray = exports.coordinatesToNearCriterias(coordinates, distance);
                return nearCriterias.concat(criteriaArray);
            }, []);

        } else {
            console.log('Unexpected feature geometry type "%s".', geometry.type);
            return null;
        }
        return nearCriterias;
    } else {
        console.log('Invalid geometry.');
        return [];
    }
}

exports.filterDuplicated = function (results) {
    var cache = {};

    var countDuplicated = 0;

    var results = results.reduce(function (results, result) {
        if (result.length && result.length > 0) {

            result.reduce(function (results, item) {



                if (!cache[item._id]) {
                    results.push(item);
                    cache[item._id] = true;
                } else {
                    countDuplicated++;
                }
                return results;
            }, results);

        }
        return results;
    }, []);

    console.info('%d results after removing %d duplicated.', results.length, countDuplicated);

    return results;
};

exports.readTracesFromFile = function (file, concatenateFeatures) {

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
        } else if (fileName.endsWith('.json')) {
            geojsonContent = JSON.parse(dom);
        } else {
            console.log('Unsuported extension for file "%s".', file.originalName);
            return deffered.reject('Unsuported file extension.');
        }

        var convertProjection = false;

        if (geojsonContent.crs && geojsonContent.crs.properties && geojsonContent.crs.properties.name === 'EPSG:3943') {
            convertProjection = true;
        }


        if (concatenateFeatures && geojsonContent.features.length > 1) {

            // concatenate all LineString & MultiLineString in a single MultiLineString

            var coordinates = geojsonContent.features.reduce(function (coordonates, feature) {

                if (feature.geometry.type === 'LineString') {
                    coordonates.push(feature.geometry.coordinates);
                } else if (feature.geometry.type === 'MultiLineString') {
                    coordonates = coordonates.concat(feature.geometry.coordonates);
                } else {
                    console.log('Unexpected feature geometry type "%s".', feature.geometry.type);
                }
                return coordonates;
            }, []);

            var uniqueFeature = geojsonContent.features[0];

            uniqueFeature.geometry.type = 'MultiLineString';
            uniqueFeature.geometry.coordinates = coordinates;

            geojsonContent.features = [
                        uniqueFeature
                    ];

        }

        var features = geojsonContent.features.reduce(function (features, feature) {

            if (feature.geometry.type === 'LineString') {
                console.log('LineString');
                // single line
                // convert coordinates
                if (feature.geometry.coordinates.length < 2) {
                    console.log('Line with only %d points: will be ignored.', feature.geometry.coordinates.length);
                    return features;
                }
                feature.xyzCoordinates = feature.geometry.coordinates.reduce(function (xyzCoordinates, point) {

                    var pointArray = [point[0], point[1]];

                    if (convertProjection) {
                        pointArray = exports.convertPointCoordinatesToWGS84(pointArray);
                    }

                    xyzCoordinates.xy.push(pointArray);
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

                    if (!coordinates || coordinates.length < 2) {
                        console.log('Invalid line will be ignored.');
                        return xyzCoordinates;
                    }

                    var subXYZCoordinates = coordinates.reduce(function (xyzCoordinates, point) {

                        var pointArray = [point[0], point[1]];

                        if (convertProjection) {
                            pointArray = exports.convertPointCoordinatesToWGS84(pointArray);
                        }

                        xyzCoordinates.xy.push(pointArray);

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