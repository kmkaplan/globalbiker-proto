'use strict';

var Tour = require('../api/tour/tour.model');
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


var Q = require('q');

exports.init = function () {
    return Q.all([exports.initFrance(), exports.initToulouse()]);
};

exports.initToulouse = function() {
    var deffered = Q.defer();

    // create Toulouse region
    Region.findOne({
            'reference': 'toulouse'
        },
        function (err, region) {
            if (err) {
                console.error(err);
                deffered.reject(err);
            } else {
                if (!region) {
                    console.info('Create "Toulouse" region.');

                    Region.create({
                        name: 'Toulouse',
                        reference: 'toulouse',
                        geometry: {
                            type: "Polygon",
                            coordinates: [[[1.0753, 43.7731], [1.9336, 43.7731], [1.9336, 43.4360], [1.0753, 43.4360], [1.0753, 43.7731]]]
                        }
                    }, function (err, region) {
                        if (err) {
                            console.error(err);
                            deffered.reject(err);
                        } else {
                            deffered.resolve(region);
                        }
                    });
                }
            }
        });

    return deffered.promise;

};


exports.initFrance = function() {
    var deffered = Q.defer();

    // create Toulouse region
    Region.findOne({
            'reference': 'france'
        },
        function (err, region) {
            if (err) {
                console.error(err);
                deffered.reject(err);
            } else {
                if (!region) {
                    console.info('Create "France" region.');

                    Region.create({
                        name: 'France',
                        reference: 'france',
                        geometry: {
                            type: "Polygon",
                            coordinates: [[[-4, 70], [10, 70], [10, 40], [-4, 40], [-4, 70]]]
                        }
                    }, function (err, region) {
                        if (err) {
                            console.error(err);
                            deffered.reject(err);
                        } else {
                            deffered.resolve(region);
                        }
                    });
                }
            }
        });

    return deffered.promise;
};
