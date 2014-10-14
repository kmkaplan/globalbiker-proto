'use strict';

var Q = require('q');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var lwip = require('lwip');


exports.copyFile = function (inputPath, outputPath) {

    var deferred = Q.defer();

    var outputDir = path.dirname(outputPath)

    // ensure that directory exists
    mkdirp(outputDir, function (err) {

        if (err) {
            console.error(err);
            deferred.reject(new Error(err));
        } else {

            // copy file
            fs.createReadStream(inputPath).pipe(fs.createWriteStream(outputPath)).on('close', function () {
                console.info('File "%s" has been copied to "%s".', inputPath, outputPath);
                deferred.resolve('success');
            });
        }

    });

    return deferred.promise;

};
exports.removeFile = function (path, callback) {

    fs.unlink(path, callback);
};

exports.addPathSuffixBeforeFileExtension = function (inputPath, suffix) {
    var extension = path.extname(inputPath);

    var newPath = inputPath.substring(0, inputPath.length - extension.length) + suffix + extension;

    return newPath;
};

exports.getHttpPath = function (filePath) {
    return '/images/' + path.basename(filePath).toLowerCase();
};

exports.createThumbnail = function (inputPath, outputPath, width) {

    var deferred = Q.defer();

    var extension = path.extname(inputPath).substring(1);

    fs.readFile(inputPath, function (err, buffer) {

        if (err) {
            console.error(err);
            deferred.reject(new Error(err));
        } else {
            try {
                lwip.open(buffer, extension, function (err, image) {
                    if (err) {
                        console.error(err);
                        console.warn('Can not resize image "%s"', inputPath);
                        deferred.resolve(exports.copyFile(inputPath, outputPath));

                    } else {

                        var height = width / image.width() * image.height();

                        image.resize(width, height, function () {

                            image.writeFile(outputPath, function () {
                                deferred.resolve('success');
                            });

                        })
                    }

                });
            } catch (err) {
                deferred.reject(new Error(err));
                console.log("Error:", err)
            }
        }
    });
    return deferred.promise;
};