'use strict';

angular.module('globalbikerWebApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('tour.step', {
                url: '/step/:stepReference',
                abstract: true,
                template: '<ui-view/>',
                resolve: {
                    step: function (tour, $stateParams, $q, stepLoaderService, PhotoRepository) {

                        var deffered = $q.defer();

                        if ($stateParams.stepReference) {

                            stepLoaderService.loadStepByReference(tour._id, $stateParams.stepReference, {
                                tour: {},
                                step: {
                                    interestsAround: {
                                        distance: [
                                            // large distance types
                                            10000, 10000, 10000,
                                            // medium distance types
                                            2000, 2000, 2000, 2000,
                                            // low distance types
                                            200, 200, 200, 200],
                                        type: [ // large distance types
                                            'interest', 'hobbies', 'accomodation',
                                            // medium distance types
                                            'information', 'water-point', 'bike-shops', 'food',
                                            // low distance types
                                            'danger', 'water-point', 'wc', 'velotoulouse']
                                    },
                                    photosAround: {}
                                }
                            }).then(function (step) {
                                console.info('Step %s loaded successfully.', step._id);

                                if (tour.steps) {
                                    var res = tour.steps.reduce(function (res, stepInLoop) {
                                        if (!res.found) {
                                            res.index++;
                                            if (step._id === stepInLoop._id) {
                                                res.found = true;
                                            }
                                        }
                                        return res;
                                    }, {
                                        found: false,
                                        index: 0
                                    });

                                    if (res.found) {
                                        step.tourStepIndex = res.index;
                                        step.tourStepsNumber = tour.steps.length;
                                        console.log('Step %d/%d', step.tourStepIndex, step.tourStepsNumber);

                                        var i = step.tourStepIndex - 1;
                                        if (i !== 0) {
                                            step.previous = tour.steps[i - 1];
                                        }
                                        if (i !== (tour.steps.length - 1)) {
                                            step.next = tour.steps[i + 1];
                                        }
                                    }
                                }

                                deffered.resolve(step);

                                if (step.photoId) {
                                    PhotoRepository.get({
                                        id: step.photoId
                                    }, function (photo) {
                                        step.photo = photo;
                                    }, function (err) {
                                        console.error(err);
                                    });

                                }

                            }, function (err) {
                                console.error(err);
                                deffered.resolve(null);
                            });

                        } else {
                            console.error('Step id is not defined.');
                            deffered.resolve(null);
                        }

                        return deffered.promise;
                    }
                }
            });
    });