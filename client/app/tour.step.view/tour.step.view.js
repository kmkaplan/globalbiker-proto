'use strict';

angular.module('globalbikerWebApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('tour.step.view', {
                url: '/view',
                templateUrl: 'app/tour.step.view/tour.step.view.html',
                controller: 'TourStepViewCtrl'
            });
    });