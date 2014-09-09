/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `
 DB: false`
 */

'use strict';

var Tour = require('../api/tour/tour.model');
var User = require('../api/user/user.model');


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
    });

    User.findOne({
        email: 'arthur@test.com'
    }, function (err, arthur) {

        Tour.find({}).remove(function () {
            if (arthur) {
                Tour.create({
                    "userId": ObjectId(arthur._id),
                    "title": "Test",
                    "country": {
                        "geonameId": 3017382,
                        "name": "France",
                        "countryCode": "FR"
                    }
                });
            }

        });

    });
});
