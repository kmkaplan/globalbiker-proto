/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `
 DB: false`
 */

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
var SeedInit = require('./seed.init');
var SeedReset = require('./seed.reset');
var SeedUpgrade = require('./seed.upgrade');


var Q = require('q');

var functions = [
    SeedInit.init,
    SeedReset.reset,
    SeedUpgrade.patchToursRegion
];

return functions.reduce(function (soFar, f) {
    return soFar.then(f());
}, Q(null));