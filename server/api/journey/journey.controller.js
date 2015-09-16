'use strict';

var _ = require('lodash');
var Journey = require('./journey.model');
var jsonpatch = require('fast-json-patch');
var ObjectId = require('mongoose').Types.ObjectId;
var JourneyService = require('./journey.service');
var config = require('../../config/environment');
var PhotoService = require('../photo/photo.service');

// Get list of journeys
exports.index = function (req, res) {
    Journey.find(function (err, journeys) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, journeys);
    });
};

// Get a single journey
exports.show = function (req, res) {
    
    var populate = 'photos';
    
    console.log('test');
    
    JourneyService.findJourney(req.params.reference, req.user, false, populate).then(function (journey) {
       
        console.log('test2');
        
        res.json(journey);
    }, function(err){
        return handleError(res, err);
    });
};

// Creates a new journey in the DB.
exports.create = function (req, res) {

    // set author
    req.body.authors = [req.user._id];

    Journey.create(req.body, function (err, journey) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, journey);
    });
};


// Creates a new photo in the DB.
exports.addPhoto = function (req, res) {

    var file = req.file;

    if (!file) {
        console.log('File "file" is missing.');
        return res.send(400, 'File "file" is missing.');
    }
    
    JourneyService.findJourney(req.params.reference, req.user).then(function (journey) {

        var patches = req.body.patches;

        PhotoService.createPhoto(file, req.user._id).then(function (photo) {
            
            
            journey.photos.push(photo);

            console.log('Journey: ', journey);
            
            journey.save(function (err) {
                if (err) {
                    return handleError(res, err);
                }
                return res.json(200, photo);
            });
            
        }, function (err) {
            return handleError(res, err);
        }).done();

    }, function (err) {
        return handleError(res, err);
    }).done();

};

exports.patch = function (req, res) {

    JourneyService.findJourney(req.params.reference, req.user).then(function (journey) {

        var patches = req.body.patches;

        jsonpatch.apply(journey, patches);

        journey.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, journey);
        });
    }, function (err) {
        return handleError(res, err);
    });
};

// Deletes a journey from the DB.
exports.destroy = function (req, res) {
    Journey.findOne({
        reference: req.params.reference
    }).exec(function (err, journey) {
        if (err) {
            return handleError(res, err);
        }
        if (!journey) {
            return res.send(404);
        }
        journey.remove(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}