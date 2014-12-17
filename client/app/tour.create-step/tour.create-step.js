'use strict';

angular.module('globalbikerWebApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('tour.create-step', {
                url: '/create-step',
                templateUrl: 'app/tour.create-step/tour.create-step.html',
                controller: 'TourCreateStepCtrl',
                data: {
                    edit: false
                }
            });
    });