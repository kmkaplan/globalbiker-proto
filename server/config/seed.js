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

var Q = require('q');

return;

Interest.find({
    geometry: null
}, function (err, interests) {
    if (err) {
        console.error(err);
    } else {
        console.info('Convert %d interests without geometry.', interests.length);

        interests.reduce(function (o, interest) {
            interest.geometry = {
                type: 'Point',
                coordinates: [interest.longitude, interest.latitude]
            };
 
            interest.save(function (err) {
                if (err) {
                    console.error(err);
                }
            });
        }, null);

    }
});

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