'use strict';

angular.module('globalbikerWebApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('tour.step.edit', {
                url: '/edit',
                templateUrl: 'app/tour.step.edit/tour.step.edit.html',
                controller: 'TourStepEditCtrl'
            });
    });