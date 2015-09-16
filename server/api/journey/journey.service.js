'use strict';

var referenceCreator = require('../../components/string/reference.creator');
var Journey = require('./journey.model');
var config = require('../../config/environment');
var PhotoService = require('../photo/photo.service');
var q = require('q');

Journey.schema.pre('validate', function (next) {
    console.log('Pre validate Journey');
    var journey = this;
    fillMissingProperties(journey)
    next();
});

exports.isAdmin = function (user) {
    return user && user._id && config.userRoles.indexOf(user.role) >= config.userRoles.indexOf('admin');
}

exports.findJourney = function(reference, user, checkRights, populate) {

    if (typeof(populate) === 'undefined'){
        populate = '';
    }
    
    if (typeof(checkRights) === 'undefined'){
        checkRights = true;
    }
    
    return q.Promise(function (resolve, reject, notify) {

        var params = {
            reference:  reference
        };
        
        if (checkRights && !exports.isAdmin(user)) {
            // check that current user is one of the authors
            if (user){
                params.authors = user._id;
            }else{
                // always fail
                return reject(new Error('Not allowed.'));
            }
        }
        
        console.log('Params: ', params);
        
        Journey.findOne(params).populate(populate).exec(function (err, journey) {

            if (err) {
                return reject(err);
            }
            if (!journey) {
                return reject(new Error('Journey not fount.'));
            }

            resolve(journey);
        });
    });
}

function fillMissingProperties(journey) {

    console.log('fillMissingProperties:', journey);

    if (!journey.properties) {
        journey.properties = {};
    }

    if (!journey.properties.title || journey.properties.title.trim().length === 0) {
        // build journey title
        journey.properties.title = 'Voyage de ' + journey.geo.cityFrom.name + ' à ' + journey.geo.cityTo.name;
    }

    // build journey reference
    if (!journey.reference) {
        journey.reference = referenceCreator.createReferenceFromString(journey.properties.title + '-' + Math.floor((Math.random() * 1000) + 1));
    }

    if (journey.steps) {
        journey.steps.reduce(function (o, step) {
            if (!step.reference) {
                // build step reference
                step.reference = referenceCreator.createReferenceFromString(step.geo.cityFrom.name + '-' + step.geo.cityTo.name + '-' + Math.floor((Math.random() * 1000) + 1));
            }
            return null;
        }, null);
    }

}