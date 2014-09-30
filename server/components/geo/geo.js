'use strict';

var Q = require('q');
var fs = require('fs');
var DOMParser = require('xmldom').DOMParser;
var togeojson = require('togeojson');
var tcx = require('tcx');
var S = require('string');
var proj4 = require('proj4');

exports.projections = {
    'EPSG:3943': '+proj=lcc +lat_1=42.25 +lat_2=43.75 +lat_0=43 +lon_0=3 +x_0=1700000 +y_0=2200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
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

        var linesCount = 0;

        var traces = geojsonContent.features.reduce(function (tracesOutput, currentFeature) {

            var lines;

            if (currentFeature.geometry.type === 'LineString') {
                // single line
                console.log(currentFeature.geometry);
                lines = [exports.buildLine(currentFeature.geometry.coordinates)];
            } else if (currentFeature.geometry.type === 'MultiLineString') {
                // multiple lines
                lines = currentFeature.geometry.coordinates.reduce(function (linesOutput, coordinates) {
                    linesOutput.push(exports.buildLine(coordinates));
                    return linesOutput;
                }, []);

            } else {
                console.log('Unexpected feature geometry type "%s".', currentFeature.geometry.type);
            }

            linesCount += lines.length;

            tracesOutput.push({
                properties: currentFeature.properties,
                lines: lines
            });

            return tracesOutput;

        }, []);

        console.log('%d trace(s) (%d lines) have been read.', traces.length, linesCount);

        deffered.resolve(traces);

    });
    return deffered.promise;
};