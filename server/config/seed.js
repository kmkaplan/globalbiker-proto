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

var resetAdmin = function () {

    var deffered = Q.defer();

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
            console.log('finished populating users');
            deffered.resolve('finished populating users');
        });

    });

    return deffered.promise;

}

if (config.resetAdminPassword) {
    resetAdmin();
}

Region.findOne({
        'name': 'Toulouse'
    },
    function (err, region) {
        if (err) {
            console.error(err);
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
                    }
                });
            }
        }
    });

Region.findOne({
        'name': 'France'
    },
    function (err, region) {
        if (err) {
            console.error(err);
        } else {
            if (!region) {
                console.info('Create "France" region.');

                Region.create({
                    name: 'France',
                    reference: 'france',
                    geometry: {
                        type: "Polygon",
                        coordinates: [[[-5.339, 51.468], [10.854, 51.468], [10.854, 42.229], [-5.339, 42.229], [-5.339, 51.468]]]
                    }
                }, function (err, region) {
                    if (err) {
                        console.error(err);
                    }
                });
            }
        }
    });

Step.find({
    'cityTo.geometry': null
}, function (err, steps) {
    if (err) {
        console.error(err);
    } else if (steps.length !== 0) {
        console.info('Convert %d steps cityTo/cityFrom geometry.', steps.length);

        steps.reduce(function (promises, step) {

            step.cityFrom.geometry = {
                'type': 'Point',
                coordinates: step.cityFrom.geometry.coordinates
            }
            step.cityTo.geometry = {
                'type': 'Point',
                coordinates: step.cityTo.geometry.coordinates
            }
            if (!step.interest) {
                step.interest = 3;
            }

            promises.push(step.save());

            return promises;

        }, []);

    }
});

InterestType.find({}, function (err, interesttypes) {
    if (err) {
        console.error(err);
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
            }, {
                reference: 'velotoulouse',
                color: '#ff6c00',
                icon: null
            }, function () {
                console.log('finished populating interest types');
            });
        }
    }
});

License.find({}, function (err, licenses) {
    if (err) {
        console.error(err);
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
            }, function () {
                console.log('finished populating licenses');
            });


        }
    }
});


var downloadPhotosFromProd = function () {
    var deffered = Q.defer();

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

    return deffered.promise;

}

if (config.downloadPhotosFromProd) {
    downloadPhotosFromProd();
}