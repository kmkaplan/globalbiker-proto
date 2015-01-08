'use strict';

var Tour = require('./tour.model');
var Step = require('../step/step.model');
var logger = require('../../components/logger/logger');

var Q = require('q');

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
            // tour fount

            Step.find({
                'tourId': tour.id
            }, function (err, steps) {
                if (err) {
                    logger.error(err);
                    deffered.reject(err);
                } else {

                    // steps fount
                    if (steps.length !== 0) {
                        // update tour interest from step interests
                        var interestsSum = steps.reduce(function (sum, step) {
                            if (step.interest){
                                sum + step.interest;
                            }
                            return sum;
                        }, 0);
                        tour.interest = Math.round(interestsSum / steps.length);

                        // update tour difficulty from step difficulties
                        var difficultySum = steps.reduce(function (sum, step) {
                            if (step.difficulty){
                                sum + step.difficulty;
                            }
                            return sum;
                        }, 0);
                        tour.difficulty = Math.round(difficultySum / steps.length);
                        
                        // update tour difficulty from step difficulties
                        var distance = steps.reduce(function (sum, step) {
                            if (step.distance){
                                sum += step.distance;
                            }
                            return sum;
                        }, 0);
                        tour.distance = distance;

                    } else {
                        tour.interest = null;
                        tour.difficulty = null;
                    }
                    tour.save(function (err) {
                        if (err) {
                            logger.error(err);
                            deffered.reject(err);
                        } else {
                            // tour updated
                            logger.info('Tour %s (interest: %d, difficulty: %d).', tour._id, tour.interest, tour.difficulty, {});
                            return deffered.resolve(tour);
                        }
                    });
                }

            });
        }
    });

    return deffered.promise;
};