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
    return exports.initLicenses();
};
exports.initLicenses = function () {
    var deffered = Q.defer();

    // init licenses
    License.find({}, function (err, licenses) {
        if (err) {
            console.error(err);
            deffered.reject(err);
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
                }, function (err, licenses) {
                    if (err) {
                        console.error(err);
                        deffered.reject(err);
                    } else {
                        deffered.resolve(licenses);
                    }
                });
            }
        }
    });
    return deffered.promise;
};