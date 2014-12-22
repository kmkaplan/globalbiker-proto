'use strict';

angular.module('globalbikerWebApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('tour.step', {
                url: '/step/:stepId',
                abstract: true,
                template: '<ui-view/>',
                resolve: {
                    step: function (tour, $stateParams, $q, tourLoaderService) {

                        var deffered = $q.defer();

                        if ($stateParams.stepId) {
                            var step = tour.steps.reduce(function (step, currentStep) {
                                if (currentStep._id === $stateParams.stepId) {
                                    return currentStep;
                                }
                                return step;

                            }, null);

                            console.info('Step %s loaded successfully.', step._id);
                            deffered.resolve(step);
                        } else {
                            console.error('Step id is not defined.');
                            deffered.resolve(null);
                        }

                        return deffered.promise;
                    }
                }
            });
    });