'use strict';

angular.module('globalbikerWebApp')
    .service('stepLoaderService', function ($q, StepRepository, PhotoRepository, InterestRepository, photoLoaderService, tourLoaderService, interestLoaderService) {
        // AngularJS will instantiate a singleton by calling "new" on this function

        return {

            getStep: function (stepId, options) {
                var deffered = $q.defer();

                StepRepository.get({
                        id: stepId
                    }, function (step) {
                        deffered.resolve(step);
                    },
                    function (err) {
                        console.error(err);
                        deffered.reject(err);
                    });

                return deffered.promise;
            },
            getPhotosAroundStep: function (step, options) {
                var deffered = $q.defer();

                if (options.step && options.step.photosAround) {

                    if (!options.step.photosAround.distance) {
                        options.step.photosAround.distance = 200;
                    }

                    PhotoRepository.searchAroundStep({
                            stepId: step._id,
                            distance: options.step.photosAround.distance
                        }, function (photos) {
                            step.photos = photos;
                            deffered.resolve(step);
                        },
                        function (err) {
                            deffered.reject(err);
                        });

                } else {
                    deffered.resolve(step);
                }

                return deffered.promise;
            },
            getStepTour: function (step, options) {
                var deffered = $q.defer();

                if (options.tour) {

                    tourLoaderService.loadTour(step.tourId, options).then(function (tour) {
                            step.tour = tour;
                            deffered.resolve(step);
                        },
                        function (err) {
                            deffered.reject(err);
                        });

                } else {
                    deffered.resolve(step);
                }

                return deffered.promise;
            },

            getInterests: function (step, options) {
                var deffered = $q.defer();

                if (options.step.interests) {
                    // retrieve interests
                    var deffered = $q.defer();

                    InterestRepository.getByStep({
                        stepId: step._id
                    }, function (interests) {


                        var defferedArray = interests.reduce(function (defferedArray, interest) {

                            defferedArray.push(interestLoaderService.loadDetails(interest, {
                                interest: options.step.interests
                            }));
                            return defferedArray;

                        }, []);

                        $q.all(defferedArray).then(function (interests) {
                                step.interests = interests;
                                deffered.resolve(step);
                            },
                            function (err) {
                                deffered.reject(err);
                            });
                    });
                    return deffered.promise;
                } else {
                    deffered.resolve(step);
                }

                return deffered.promise;
            },

            getDistances: function (step, options) {
                var deffered = $q.defer();

                if (options.step && options.step.distances) {

                    if (step.distance) {
                        step.readableDistance = L.GeometryUtil.readableDistance(step.distance, 'metric');
                    }
                    if (step.positiveElevationGain) {
                        step.readablePositiveElevationGain = L.GeometryUtil.readableDistance(step.positiveElevationGain, 'metric');
                    }
                    if (step.negativeElevationGain) {
                        step.readableNegativeElevationGain = L.GeometryUtil.readableDistance(step.negativeElevationGain, 'metric');
                    }
                }
                deffered.resolve(step);

                return deffered.promise;
            },

            loadDetails: function (step, options) {
                var self = this;

                var deffered = $q.defer();

                this.getStepTour(step, options).then(function (step) {

                    self.getPhotosAroundStep(step, options).then(function (step) {

                        self.getInterests(step, options).then(function (step) {

                           self.getDistances(step, options).then(function (step) {

                            deffered.resolve(step);

                        }, function (err) {
                            console.error(err);
                            deffered.reject(err);
                        });

                        }, function (err) {
                            console.error(err);
                            deffered.reject(err);
                        });

                    }, function (err) {
                        console.error(err);
                        deffered.reject(err);
                    });
                }, function (err) {
                    console.error(err);
                    deffered.reject(err);
                });

                return deffered.promise;
            },

            loadStep: function (stepId, options) {
                var self = this;

                var deffered = $q.defer();

                this.getStep(stepId).then(function (step) {
                        deffered.resolve(self.loadDetails(step, options));
                    },
                    function (err) {
                        console.error(err);
                        deffered.reject(err);
                    });

                return deffered.promise;
            }
        };
    });