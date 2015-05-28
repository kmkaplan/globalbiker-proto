'use strict';

var referenceCreator = require('../../components/string/reference.creator');
var Journey = require('./journey.model');

Journey.schema.pre('validate', function (next) {
    console.log('Pre validate Journey');
    var journey = this;
    fillMissingProperties(journey)
    next();
});

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