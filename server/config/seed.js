/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `
 DB: false`
 */

'use strict';

var Tour = require('../api/tour/tour.model');
var Step = require('../api/step/step.model');
var User = require('../api/user/user.model');
var Interest = require('../api/interest/interest.model');
var io = require('../components/io/io');
var path = require('path');


var Q = require('q');


Interest.find({
        photos: {
            $not: {
                $size: 0
            }
        }
    },
    function (err, interests) {
        if (err) {
            console.error(err);
        } else {
            console.info('Found %d interests with photos.', interests.length);

            interests.reduce(function (o, interest) {

                interest.photos = interest.photos.reduce(function (photos, photo) {

                    if (!photo.thumbnails) {
                        photo.thumbnails = {};
                    }
                    if (!photo.thumbnails.w600) {

                        var photoPath = path.resolve(__dirname, '..' + photo.url);

                        var thumbnailHttpPath = io.addPathSuffixBeforeFileExtension(photoPath, '-600');

                        io.createThumbnail(photoPath, thumbnailHttpPath, 600)

                        photo.thumbnails.w600 = io.addPathSuffixBeforeFileExtension(photo.url, '-600');;

                        console.info('Photo thumbnail url: %s.', thumbnailHttpPath); 

                    }
                    photos.push(photo);

                    return photos;

                }, []);

                interest.save(function (err) {
                    if (err) {
                        console.error(err);
                    }
                })
            }, null);

        }
    });

return;

var file = req.files.file;

if (!file) {
    console.log('File "file" is missing.');
    return res.send(400, 'File "file" is missing.');
}

var imageHttpPath = io.getHttpPath(file.path);

// copy file
var outputFilePath = 'server' + imageHttpPath;

var thumbnailHttpPath = io.addPathSuffixBeforeFileExtension(imageHttpPath, '-200');
var thumbnailOutputFilePath = 'server' + thumbnailHttpPath

var imageAttributes = req.body;
imageAttributes.path = imageHttpPath;
imageAttributes.thumbnail200path = thumbnailHttpPath;


Q.all(
        [
            io.copyFile(file.path, outputFilePath),
            io.createThumbnail(file.path, thumbnailOutputFilePath, 200)
        ]
).then(function () {
    Image.create(imageAttributes, function (err, image) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, image);
    });
}, function (err) {
    return res.json(500, err);
}).done();

var resetUsers = function () {

    var deffered = Q.defer();

    User.find({}).remove(function () {
        User.create({
            provider: 'local',
            name: 'Arthur',
            email: 'arthur@test.com',
            password: 'test'
        }, {
            provider: 'local',
            name: 'Matt',
            email: 'matt@test.com',
            password: 'test'
        }, {
            provider: 'local',
            name: 'Toub',
            email: 'toub@test.com',
            password: 'test'
        }, {
            provider: 'local',
            role: 'admin',
            name: 'Admin',
            email: 'admin@admin.com',
            password: 'admin'
        }, function () {
            console.log('finished populating users');
            deffered.resolve('finished populating users');
        });

    });

    return deffered.promise;

}


var createTour = function (user, name) {

    var deffered = Q.defer();

    console.log('Create tour "%s".', name);

    Tour.findOne({
        title: name
    }).exec(function (err, tour) {

        if (tour !== null) {
            Step.find({
                tourId: tour._id
            }).remove();

            tour.remove();

        };

        Tour.create({
            "userId": user._id,
            "title": name,
            "country": {
                "geonameId": 3017382,
                "name": "France",
                "countryCode": "FR"
            }
        }, function (err, tour) {

            if (err) {
                console.error(err);
                return handleError(err);
            }

            console.log('finished creating tour %s', tour.title);
            deffered.resolve(tour);
        });


    });

    return deffered.promise;

};

function createStep(tour, cityFrom, cityTo) {

    var deffered = Q.defer();

    console.log('Create step from %s to %s for tour "%s".', cityFrom.name, cityTo.name, tour._id);

    Step.create({
        tourId: tour._id,
        difficulty: 2,
        interest: 3,
        cityFrom: cityFrom,
        cityTo: cityTo
    }, function (err, step) {
        console.log('finished creating step');
        deffered.resolve(step);
    }, function (err) {
        // console.error(err);
        deffered.reject(err);
    });

    return deffered.promise;

};

var getArthur = function () {
    var deffered = Q.defer();

    User.findOne({
        email: 'arthur@test.com'
    }, function (err, arthur) {

        if (!arthur) {
            resetUsers().then(function () {
                User.findOne({
                    email: 'arthur@test.com'
                }, function (err, arthur) {
                    deffered.resolve(arthur);
                });
            }).done();
        } else {
            deffered.resolve(arthur);
        }

    });


    return deffered.promise;

};

getArthur().then(function (arthur) {
    createTour(arthur, "Le long du Canal du Midi de Toulouse à Agde (auto)").then(function (tour) {

        createStep(tour, {
            geonameId: 2972315,
            name: "Toulouse",
            adminName1: "Midi-Pyrénées",
            latitude: 43.60426,
            longitude: 1.44367
        }, {
            geonameId: 2992655,
            name: "Montesquieu-Lauragais",
            adminName1: "Midi-Pyrénées",
            latitude: 43.41667,
            longitude: 1.62942
        });

        createStep(tour, {
            "geonameId": 2992655,
            "name": "Montesquieu-Lauragais",
            "adminName1": "Midi-Pyrénées",
            "latitude": 43.41667,
            "longitude": 1.62942
        }, {
            "geonameId": 3028351,
            "name": "Castelnaudary",
            "adminName1": "Languedoc-Roussillon",
            "latitude": 43.31829,
            "longitude": 1.95449
        });


    }).done();
}).done();