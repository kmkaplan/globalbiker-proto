'use strict';

var Tour = require('./tour.model');
var Step = require('../step/step.model');
var logger = require('../../components/logger/logger');
var geospacialFinder = require('../../components/geo/geospacial.finder');
var referenceCreator = require('../../components/string/reference.creator');

var Q = require('q');

/*Tour.schema.pre('save', function (next) {
    var tour = this;
    tour.reference = referenceCreator.createReferenceFromString(tour.title);
    next();
});

Step.schema.pre('save', function (next) {
    var step = this;
    console.log(step);
    step.reference = referenceCreator.createReferenceFromString(step.cityFrom.name + '-' + step.cityTo.name);
    next();
});*/

Step.schema.post('save', function (doc) {
    exports.updateCalculatedAttributesFromSteps(doc.tourId).done();
})

Step.schema.post('remove', function (doc) {
    exports.updateCalculatedAttributesFromSteps(doc.tourId).done();
})

exports.updateCalculatedAttributesFromSteps = function (tourId) {
    var deffered = Q.defer();

    Tour.findById(tourId, function (err, tour) {
        if (err) {
            logger.error(err);
            deffered.reject(err);
        } else {
            // tour found

            Step.find({
                'tourId': tour.id
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

                    } else {
                        tour.interest = null;
                        tour.difficulty = null;
                    }

                    var geometries = steps.reduce(function (geometries, step) {
                        if (step.geometry) {
                            geometries.push(step.geometry);
                        }
                        return geometries;
                    }, []);

                    tour.geometry = geospacialFinder.concatenateGeometries(geometries);

                    tour.numberOfSteps = steps.length;

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