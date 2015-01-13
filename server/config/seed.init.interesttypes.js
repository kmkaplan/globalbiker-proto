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
    return exports.initInterestTypes();
};
exports.initInterestTypes = function () {
    var deffered = Q.defer();

    // init interests
    InterestType.find({}, function (err, interesttypes) {
        if (err) {
            console.error(err);
            deffered.reject(err);
        } else {
            if (interesttypes.length === 0) {
                InterestType.create({
                    reference: 'interest',
                    color: '#047104',
                    icon: 'eye-open'
                }, {
                    reference: 'danger',
                    color: '#ff0014',
                    icon: 'fa-exclamation-triangle'
                }, {
                    reference: 'bike-shops',
                    color: '#f51e43',
                    icon: 'glyphicon-wrench'
                }, {
                    reference: 'food',
                    color: 'black',
                    icon: 'glyphicon-cutlery'
                }, {
                    reference: 'merimee',
                    color: '#7b188d',
                    icon: null
                }, {
                    reference: 'water-point',
                    color: '#5282ed',
                    icon: null
                }, {
                    reference: 'wc',
                    color: '#7c869b',
                    icon: null
                }, {
                    reference: 'velotoulouse',
                    color: '#ff6c00',
                    icon: null
                }, function (err, interestTypes) {
                    console.log('finished populating interest types');
                    if (err) {
                        console.error(err);
                        deffered.reject(err);
                    } else {
                        deffered.resolve(interestTypes);
                    }
                });
            }
        }
    });

    return deffered.promise;
};