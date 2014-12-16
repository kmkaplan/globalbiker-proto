'use strict';

angular.module('globalbikerWebApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('tour.step', {
                url: '/step/:stepId',
                templateUrl: 'app/tour.step/tour.step.html',
                controller: 'TourStepCtrl'
            });
    });