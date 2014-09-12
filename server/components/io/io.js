'use strict';

var Q = require('q');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

exports.copyFile = function (inputPath, outputPath) {

    var outputDir = path.dirname(outputPath)

    // ensure that directory exists
    mkdirp(outputDir, function (err) {
        // copy file
        fs.createReadStream(inputPath).pipe(fs.createWriteStream(outputPath));
    });
};