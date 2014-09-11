'use strict';

var Q = require('q');
var fs = require('fs');
var DOMParser = require('xmldom').DOMParser;
var togeojson = require('togeojson');
    
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
            deffered.reject(err);
        }

        var dom = (new DOMParser()).parseFromString(data, 'text/xml');

        var geojsonContent = togeojson.gpx(dom);

        var linesCount = 0;
        
        var traces = geojsonContent.features.reduce(function (tracesOutput, currentFeature) {

            var lines;

            if (currentFeature.geometry.type === 'LineString') {
                // single line
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