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



exports.patchStepsReferences = function () {

    Step.find({
        reference: null
    }, function (err, steps) {
        if (err) {
            console.error(err);
        } else if (steps.length !== 0) {
            console.info('Upgrade %d steps reference.', steps.length);

            var promises = steps.reduce(function (promises, step) {

                if (!step.reference) {
                    step.reference = referenceCreator.createReferenceFromString(step.cityFrom.name + '-' + step.cityTo.name);

                    console.log('Step reference: "%s": ', step.reference);
                }
                promises.push(step.save());
                return promises;
            }, []);

            Q.all(promises).then(function () {
                console.info('%d steps references upgraded successfully.', steps.length);
            }, function (err) {
                console.error(err);
            });
        }
    });

};

exports.patchToursReferences = function () {

    Tour.find({
        reference: null
    }, function (err, tours) {
        if (err) {
            console.error(err);
        } else if (tours.length !== 0) {
            console.info('Upgrade %d tours reference.', tours.length);

            var promises = tours.reduce(function (promises, tour) {

                if (!tour.reference) {
                    var reference = referenceCreator.createReferenceFromString(tour.title);
                    tour.reference = reference;
                    console.log('Tour reference: "%s": ', reference);
                }
                promises.push(tour.save());
                return promises;
            }, []);

            Q.all(promises).then(function () {
                console.info('%d tours references upgraded successfully.', tours.length);
            }, function (err) {
                console.error(err);
            });
        }
    });

};

exports.patchFrance = function () {
    Region.findOne({
            'reference': 'france'
        },
        function (err, region) {
            if (err) {
                console.error(err);
            } else {
                if (region) {
                    console.info('Update "France" region coordinates.');

                    var lngMin = -4.5;
                    var lngMax = 8;
                    var latMin = 43;
                    var latMax = 50.5;

                    region.geometry = {
                        "type": "Polygon",
                        "coordinates": [[[lngMin, latMax], [lngMax, latMax], [lngMax, latMin], [lngMin, latMin], [lngMin, latMax]]]
                    };

                    region.save(function (err, region) {
                        if (err) {
                            console.error(err);
                        } else {
                            console.info('"France" region updated.', region.geometry.coordinates);
                        }
                    });
                }
            }
        });
};