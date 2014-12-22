'use strict';

angular.module('globalbikerWebApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('tour.step', {
                url: '/step/:stepId',
                abstract: true,
                template: '<ui-view/>',
                resolve: {
                    step: function (tour, $stateParams, $q, stepLoaderService) {

                        var deffered = $q.defer();

                        if ($stateParams.stepId) {

                            stepLoaderService.loadStep($stateParams.stepId, {
                                tour: {},
                                step: {
                                    distances: true,
                                    interestsAround: {},
                                    photosAround: {}
                                }
                            }).then(function (step) {
                                console.info('Step %s loaded successfully.', step._id);
                                deffered.resolve(step);
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