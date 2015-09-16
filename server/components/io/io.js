'use strict';

var Q = require('q');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var lwip = require('lwip');
var http = require('http');

exports.downloadFile = function (url, dest) {

    var deferred = Q.defer();

    var outputDir = path.dirname(dest)

    // ensure that directory exists
    mkdirp(outputDir, function (err) {

        if (fs.existsSync(dest)) {
            // file already exists
            // console.info('File "%s" already exists on local disk.', dest);
            deferred.resolve('File already exists on local disk.');
        } else {
            console.info('Downloading photo from "%s". to local disk "%s"...', url, dest);

            // download file
            var file = fs.createWriteStream(dest);
            var request = http.get(url, function (response) {
                response.pipe(file);
                file.on('finish', function () {
                    file.close(function (res) {
                        deferred.resolve(res);
                    });
                });
            });
        }

    });

    return deferred.promise;
};

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
    return '/photos/' + path.basename(filePath).toLowerCase();
};

exports.createThumbnail = function (inputPath, outputPath, maxWidth, maxHeight) {

    var deferred = Q.defer();

    var extension = path.extname(inputPath).substring(1);

    fs.readFile(inputPath, function (err, buffer) {

        if (err) {
            console.error(err);
            deferred.reject(new Error(err));
        } else {


            if (fs.existsSync(outputPath)) {
                // file already exists
                deferred.resolve('File already exists on local disk.');
            } else {

                console.info('Creating photo thumbnail from "%s" with max (%d, %d).', inputPath, maxWidth, maxHeight);

                try {
                    lwip.open(buffer, extension, function (err, image) {
                        if (err) {
                            console.error(err);
                            console.warn('Can not resize image "%s"', inputPath);
                            deferred.resolve(exports.copyFile(inputPath, outputPath));

                        } else {

                            var width = image.width();
                            var height = image.height();


                            if (maxWidth && maxHeight) {
                                if (width > maxWidth || height > maxHeight) {
                                    if (width / maxWidth > height / maxHeight) {
                                        width = maxWidth;
                                        height = parseInt(width / image.width() * image.height());
                                    } else {
                                        console.info('Height ratio bigger than height one');
                                        height = maxHeight;
                                        width = parseInt(height / image.height() * image.width());
                                    }
                                }
                            } else if (maxWidth && width > maxWidth) {
                                width = maxWidth;
                                height = parseInt(width / image.width() * image.height());

                            } else if (maxHeight && height > maxHeight) {
                                height = maxHeight
                                width = parseInt(height / image.height() * image.width());
                            }

                            if (width !== image.width() || height !== image.height()) {
                                image.resize(width, height, function () {

                                    image.writeFile(outputPath, function () {
                                        deferred.resolve('success');
                                    });

                                })
                            } else {
                                console.info('Do not resize.');
                                exports.copyFile(inputPath, outputPath, function () {
                                    deferred.resolve('success');
                                });
                            }
                        }

                    });
                } catch (err) {
                    deferred.reject(new Error(err));
                    console.log("Error:", err)
                }
            }
        }
    });
    return deferred.promise;
};