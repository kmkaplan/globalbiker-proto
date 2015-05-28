'use strict';

var Tour = require('./tour.model');
var Step = require('../step/step.model');
var logger = require('../../components/logger/logger');
var geospacialFinder = require('../../components/geo/geospacial.finder');
var referenceCreator = require('../../components/string/reference.creator');

var Q = require('q');

Tour.schema.pre('validate', function (next) {
    var tour = this;
    fillMissingProperties(tour)
    next();
});

function fillMissingProperties(tour) {
    if (!tour.properties) {
        tour.properties = {};
    }

    if (!tour.properties.title || tour.properties.title.trim().length === 0) {
        // build tour title
        tour.properties.title = 'Voyage de ' + tour.geo.cityFrom.name + ' à ' + tour.geo.cityTo.name;
    }

    // build tour reference
    if (!tour.reference) {
        tour.reference = referenceCreator.createReferenceFromString(tour.properties.title + '-' + Math.floor((Math.random() * 1000) + 1));
    }

    if (tour.steps) {
        tour.steps.reduce(function (o, step) {
            if (!step.reference) {
                // build step reference
                step.reference = referenceCreator.createReferenceFromString(step.geo.cityFrom.name + '-' + step.geo.cityTo.name + '-' + Math.floor((Math.random() * 1000) + 1));
            }
            return null;
        }, null);
    }
    
    console.info('Tour after filling missing properties: ', tour);
}
/*
Step.schema.pre('save', function (next) {
    var step = this;
    console.log(step);
    step.reference = referenceCreator.createReferenceFromString(step.cityFrom.name + '-' + step.cityTo.name);
    next();
});*/
/*
Step.schema.post('save', function (doc) {
   // exports.updateCalculatedAttributesFromSteps(doc.tourId).done();
})

Step.schema.post('remove', function (doc) {
   // exports.updateCalculatedAttributesFromSteps(doc.tourId).done();
})*/

exports.updateCalculatedAttributesFromSteps = function (tourId) {
    var deffered = Q.defer();


    logger.info("updateCalculatedAttributesFromSteps for tour %s", tourId);

    Tour.findById(tourId, function (err, tour) {
        if (err) {
            logger.error(err);
            deffered.reject(err);
        } else {
            // tour found

            Step.find({
                'tourId': tour._id
            }).sort({
                '_id': 1
            }).exec(function (err, steps) {

                if (err) {
                    logger.error(err);
                    deffered.reject(err);
                } else {

                    // steps fount
                    if (steps.length !== 0) {


                        // update tour interest from step interests
                        var interestsSum = steps.reduce(function (sum, step) {
                            if (step.interest) {
                                sum += step.interest;
                            }
                            return sum;
                        }, 0);
                        tour.interest = Math.round(interestsSum / steps.length);

                        // update tour difficulty from step difficulties
                        var difficultySum = steps.reduce(function (sum, step) {
                            if (step.difficulty) {
                                sum += step.difficulty;
                            }
                            return sum;
                        }, 0);
                        tour.difficulty = Math.round(difficultySum / steps.length);

                        // update tour difficulty from step difficulties
                        var distance = steps.reduce(function (sum, step) {
                            if (step.distance) {
                                sum += step.distance;
                            }
                            return sum;
                        }, 0);
                        tour.distance = distance;

                        logger.info('cityFrom for tour %s.', tour._id, tour.cityFrom, {});

                        if (!tour.cityFrom || !tour.cityFrom.geonameId) {
                            tour.cityFrom = steps[0].cityFrom;
                        }
                        if (!tour.cityTo || !tour.cityTo.geonameId) {
                            tour.cityTo = steps[steps.length - 1].cityTo;
                        }

                        var geometries = steps.reduce(function (geometries, step) {
                            if (step.geometry) {
                                geometries.push(step.geometry);
                            }
                            return geometries;
                        }, []);

                        tour.geometry = geospacialFinder.concatenateGeometries(geometries);

                    }

                    tour.numberOfSteps = steps.length;
                    tour.steps = steps.reduce(function (stepIds, step) {
                        stepIds.push(step._id);
                        return stepIds;
                    }, []);

                    logger.info("Number of steps: ", tour.steps.length);

                    tour.save(function (err) {
                        if (err) {
                            logger.error(err);
                            deffered.reject(err);
                        } else {
                            // tour updated
                            logger.info('Tour %s (interest: %d, difficulty: %d, steps: %d).', tour._id, tour.interest, tour.difficulty, steps.length, {});
                            return deffered.resolve(tour);
                        }
                    });
                }

            });
        }
    });

    return deffered.promise;
};