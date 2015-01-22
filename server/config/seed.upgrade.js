/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `
 DB: false`
 */

'use strict';

var Tour = require('../api/tour/tour.model');
var TourService = require('../api/tour/tour.service');
var License = require('../api/license/license.model');
var Photo = require('../api/photo/photo.model');
var Region = require('../api/region/region.model');
var InterestType = require('../api/interesttype/interesttype.model');
var Step = require('../api/step/step.model');
var User = require('../api/user/user.model');
var Interest = require('../api/interest/interest.model');
var InterestCtrl = require('../api/interest/interest.controller');
var io = require('../components/io/io');
var path = require('path');
var config = require('./environment');
var referenceCreator = require('../components/string/reference.creator');

var Q = require('q');

exports.upgradeTourAttributes = function () {

    Tour.find({}, function (err, tours) {
        if (err) {
            console.error(err);
        } else if (tours.length !== 0) {
            console.info('Upgrade %d tours attributes.', tours.length);

            var promises = tours.reduce(function (promises, tour) {
                promises.push(TourService.updateCalculatedAttributesFromSteps(tour._id));
                return promises;
            }, []);

            Q.all(promises).then(function () {
                console.info('%d tours attributes upgraded successfully.', tours.length);
            }, function (err) {
                console.error(err);
            });
        }
    });

};

exports.patchToursRegion = function () {

    Region.findOne({
        'reference': 'france'
    }, function (err, region) {
        if (err) {
            console.error(err);
        } else {

            Tour.find({
                region: null
            }, function (err, tours) {
                if (err) {
                    console.error(err);
                } else if (tours.length !== 0) {
                    console.info('Upgrade %d tours region.', tours.length);

                    var promises = tours.reduce(function (promises, tour) {

                        tour.region = region;
                        promises.push(tour.save());
                        return promises;
                    }, []);

                    Q.all(promises).then(function () {
                        console.info('%d tours region upgraded successfully.', tours.length);
                    }, function (err) {
                        console.error(err);
                    });
                }
            });
        }
    });
};

exports.patchToursStatus = function () {

    Tour.find({
        status: null
    }, function (err, tours) {
        if (err) {
            console.error(err);
        } else if (tours.length !== 0) {
            console.info('Upgrade %d tours status.', tours.length);

            var promises = tours.reduce(function (promises, tour) {

                tour.status = 'validated';
                promises.push(tour.save());
                return promises;
            }, []);

            Q.all(promises).then(function () {
                console.info('%d tours status upgraded successfully.', tours.length);
            }, function (err) {
                console.error(err);
            });
        }
    });

};

exports.patchToursAuthors = function () {

    Tour.find({
        authors: null
    }, function (err, tours) {
        if (err) {
            console.error(err);
        } else if (tours.length !== 0) {
            console.info('Upgrade %d tours authors.', tours.length);

            var promises = tours.reduce(function (promises, tour) {

                if (!tour.authors || tour.authors.length === 0) {
                    tour.authors = [tour.userId];
                }
                promises.push(tour.save());
                return promises;
            }, []);

            Q.all(promises).then(function () {
                console.info('%d tours authors upgraded successfully.', tours.length);
            }, function (err) {
                console.error(err);
            });
        }
    });

};