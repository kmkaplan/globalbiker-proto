/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `
 DB: false`
 */

'use strict';

var Tour = require('../api/tour/tour.model');
var License = require('../api/license/license.model');
var Step = require('../api/step/step.model');
var User = require('../api/user/user.model');
var Interest = require('../api/interest/interest.model');
var InterestCtrl = require('../api/interest/interest.controller');
var io = require('../components/io/io');
var path = require('path');
var config = require('./environment');


var Q = require('q');

License.find({}, function (err, licenses) {
    if (err) {
        console.error(err);
    } else {
        if (licenses.length === 0) {
            License.create({
                name: 'CC BY 4.0',
                url: 'http://creativecommons.org/licenses/by/4.0'
            }, {
                name: 'CC BY-SA 4.0',
                url: 'http://creativecommons.org/licenses/by-sa/4.0'
            }, {
                name: 'CC BY-ND 4.0',
                url: 'http://creativecommons.org/licenses/by-nd/4.0'
            }, {
                name: 'CC BY-NC 4.0',
                url: 'http://creativecommons.org/licenses/by-nc/4.0'
            }, {
                name: 'CC BY-NC-SA 4.0',
                url: 'http://creativecommons.org/licenses/by-nc-sa/4.0'
            }, {
                name: 'CC BY-NC-ND 4.0',
                url: 'http://creativecommons.org/licenses/by-nc-nd/4.0'
            }, function () {
                console.log('finished populating licenses');
            });
        } else if (licenses.length === 6) {
            License.create({
                name: 'CC BY 3.0',
                url: 'http://creativecommons.org/licenses/by/3.0'
            }, {
                name: 'CC BY-SA 3.0',
                url: 'http://creativecommons.org/licenses/by-sa/3.0'
            }, {
                name: 'CC BY-ND 3.0',
                url: 'http://creativecommons.org/licenses/by-nd/3.0'
            }, {
                name: 'CC BY-NC 3.0',
                url: 'http://creativecommons.org/licenses/by-nc/3.0'
            }, {
                name: 'CC BY-NC-SA 3.0',
                url: 'https://creativecommons.org/licenses/by-nc-sa/3.0/'
            }, {
                name: 'CC BY-NC-ND 3.0',
                url: 'http://creativecommons.org/licenses/by-nc-nd/3.0'
            }, {
                name: 'CC BY 2.0',
                url: 'http://creativecommons.org/licenses/by/2.0'
            }, {
                name: 'CC BY-SA 2.0',
                url: 'http://creativecommons.org/licenses/by-sa/2.0'
            }, {
                name: 'CC BY-ND 2.0',
                url: 'http://creativecommons.org/licenses/by-nd/2.0'
            }, {
                name: 'CC BY-NC 2.0',
                url: 'http://creativecommons.org/licenses/by-nc/2.0'
            }, {
                name: 'CC BY-NC-SA 2.0',
                url: 'https://creativecommons.org/licenses/by-nc-sa/2.0/'
            }, {
                name: 'CC BY-NC-ND 2.0',
                url: 'http://creativecommons.org/licenses/by-nc-nd/2.0'
            }, function () {
                console.log('finished populating licenses');
            });


        }
    }
});


var downloadPhotosFromProd = function (interest) {

    //  console.info('Download photos for interest %s.', interest.name);

    var deffered = Q.defer();
    if (config.downloadPhotosFromProd) {

        // create thumbnail
        var defferedArray = interest.photos.reduce(function (defferedArray, photo) {

            // download photos
            interest.photos.reduce(function (o, photo) {

                var localDiskPath = path.resolve(__dirname, '..' + photo.url);
                defferedArray.push(io.downloadFile(config.prodUrl + photo.url, localDiskPath));
            }, []);


            return defferedArray;

        }, []);

        Q.all(defferedArray).then(function (photos) {
            deffered.resolve('success');
        }).done();
    } else {
        deffered.resolve('success');
    }

    return deffered.promise;
}

var createThumbnails = function (interest) {

    //   console.info('Create thumbnails for interest %s.', interest.name);

    var deffered = Q.defer();

    // create thumbnail
    var defferedArray = interest.photos.reduce(function (defferedArray, photo) {

        delete photo.thumbnails.w600;
        delete photo.thumbnail200;
        delete photo.thumbnail400;
        delete photo.thumbnail600;

        defferedArray.push(InterestCtrl.createThumbnail(photo, 600, 400));

        return defferedArray;

    }, []);

    Q.all(defferedArray).then(function (photos) {

        interest.photos = photos;

        interest.save(function (err) {
            if (err) {
                console.error(err);
                deffered.reject(err);
            } else {
                deffered.resolve('success');
            }
        }.done())
    });

    return deffered.promise;
};

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

                // console.info('Interest %s with %d photos.', interest.name, interest.photos.length);

                downloadPhotosFromProd(interest).then(function () {

                    // create thumbnail
                    createThumbnails(interest).done();

                }).done();


            }, null);

        }
    });

return;


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