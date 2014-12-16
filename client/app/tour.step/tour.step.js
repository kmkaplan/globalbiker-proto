'use strict';

angular.module('globalbikerWebApp')
    .config(function ($stateProvider) {
    $stateProvider
        .state('tour.step', {
            url: '/step/:stepId',
            templateUrl: 'app/tour.step/tour.step.html',
            controller: 'TourStepCtrl',
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