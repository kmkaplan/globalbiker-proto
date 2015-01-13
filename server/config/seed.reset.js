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

var Q = require('q');

exports.reset = function () {
    return Q.all([
        exports.resetAdmin(),
        exports.downloadPhotosFromProd()]);
}

exports.resetAdmin = function () {

    var deffered = Q.defer();

    if (config.resetAdminPassword) {
        User.find({
            email: 'admin@admin.com'
        }).remove(function () {
            User.create({
                provider: 'local',
                role: 'admin',
                name: 'Admin',
                email: 'admin@admin.com',
                password: 'admin'
            }, function () {
                console.log('finished populating admin');
                deffered.resolve('finished populating admin');
            });

        });
    } else {
        deffered.resolve('Do not reset users');
    }

    return deffered.promise;

};

// download from prod
exports.downloadPhotosFromProd = function () {
    var deffered = Q.defer();

    if (config.downloadPhotosFromProd) {
        Photo.find({}, function (err, photos) {

            if (err) {
                console.error(err);
                deffered.reject(err);
            }

            var defferedArray = photos.reduce(function (defferedArray, photo) {

                var localDiskPath = path.resolve(__dirname, '..' + photo.url);
                defferedArray.push(io.downloadFile(config.prodUrl + photo.url, localDiskPath));
                return defferedArray;
            }, []);

            console.log('Download %d photos from prod.', defferedArray.length);

            Q.all(defferedArray).then(function (photos) {
                deffered.resolve('success');
            }).done();

        }, []);
    } else {
        deffered.resolve('Do not download photos from prod');
    }
    return deffered.promise;

};