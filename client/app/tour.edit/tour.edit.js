'use strict';

angular.module('globalbikerWebApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('tour.edit', {
                url: '/edit',
                templateUrl: 'app/tour.edit/tour.edit.html',
                controller: 'TourEditCtrl'
            });
    });