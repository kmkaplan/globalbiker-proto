(function () {
    'use strict';

    var io = require('../../components/io/io');
    var q = require('q');
    var Photo = require('./photo.model');
    var multer = require('multer');
    var localEnv = require('../../config/local.env');

    var uploadService = null;

    exports.uploadService = function () {

        if (uploadService === null) {

            var storage = multer.diskStorage({
                destination: localEnv.photosDir,
                filename: function (req, file, cb) {
                    var newFileName = Date.now() + '-' + file.originalname.replace(/\s/g, '-').toLowerCase();
                    cb(null, newFileName);
                }
            })

            uploadService = multer({
                storage: storage
            });

        }

        return uploadService;
    };

    exports.createPhoto = function (file, userId) {

        return q.Promise(function (resolve, reject, notify) {

            var thumbnailsConfig = [{
                maxWidth: 600,
                maxHeight: 400
            }, {
                maxWidth: 300,
                maxHeight: 200
            }, {
                maxWidth: 150,
                maxHeight: 100
            }];

            exports.createThumbnails(file, thumbnailsConfig).then(function (thumbnails) {

                var photo = {
                    owner: userId,
                    url: io.getHttpPath(file.path),
                    thumbnails: thumbnails,
                };

                console.log('Create photo:', photo);

                Photo.create(photo, function (err, photo) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(photo);
                    }
                });

            }, function (err) {
                reject(err);
            }).done();
        });
    }

    exports.createThumbnails = function (file, thumbnailsConfigList) {

        var promises = thumbnailsConfigList.reduce(function (promises, thumbnailConfig) {
            var promise =
                exports.createThumbnail(file, thumbnailConfig.maxWidth, thumbnailConfig.maxHeight);
            promise.done();
            promises.push(promise);
            return promises;
        }, []);

        var promise = q.all(promises);
        promise.done();

        return promise;

    };

    exports.createThumbnail = function (file, maxWidth, maxHeight) {

        var suffix = 'w' + maxWidth + 'h' + maxHeight;

        return q.Promise(function (resolve, reject, notify) {

            var imageHttpPath = io.getHttpPath(file.path);

            var thumbnailHttpPath = io.addPathSuffixBeforeFileExtension(imageHttpPath, '-' + suffix);
            var thumbnailOutputFilePath = io.addPathSuffixBeforeFileExtension(file.path, '-' + suffix);

            io.createThumbnail(file.path, thumbnailOutputFilePath, maxWidth, maxHeight).then(function () {

                var thumbnail = {
                    maxWidth: maxWidth,
                    maxHeight: maxHeight,
                    url: thumbnailHttpPath
                };

                resolve(thumbnail);

            }, function (err) {
                reject(err);
            }).done();

        });

    };

}());