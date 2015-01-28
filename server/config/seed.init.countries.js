'use strict';

var Country = require('../api/country/country.model');
var io = require('../components/io/io');
var path = require('path');
var config = require('./environment');


var Q = require('q');

exports.init = function () {
    return Q.all([exports.initFrance(), exports.initBelgium()]);
};

exports.initFrance = function () {
    var deffered = Q.defer();

    Country.findOne({
            'countryCode': 'FR'
        },
        function (err, country) {
            if (err) {
                console.error(err);
                deffered.reject(err);
            } else {
                if (!country) {
                    console.info('Create "France" country.');

                    Country.create({
                            // geonames
                            "geonameId": 3017382,
                            "countryCode": "FR",
                            "name": "France"
                        },
                        function (err, country) {
                            if (err) {
                                console.error(err);
                                deffered.reject(err);
                            } else {
                                deffered.resolve(country);
                            }
                        });
                }
            }
        });

    return deffered.promise;
};

exports.initBelgium = function () {
    var deffered = Q.defer();

    Country.findOne({
            'countryCode': 'BE'
        },
        function (err, country) {
            if (err) {
                console.error(err);
                deffered.reject(err);
            } else {
                if (!country) {
                    console.info('Create "France" country.');

                    Country.create({
                            // geonames
                            "geonameId": 2802361,
                            "countryCode": "BE",
                            "name": "Belgium"
                        },
                        function (err, country) {
                            if (err) {
                                console.error(err);
                                deffered.reject(err);
                            } else {
                                deffered.resolve(country);
                            }
                        });
                }
            }
        });

    return deffered.promise;
};