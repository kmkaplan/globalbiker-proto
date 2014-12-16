'use strict';

angular.module('globalbikerWebApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('tour.presentation', {
                url: '/',
                templateUrl: 'app/tour.presentation/tour.presentation.html',
                controller: 'TourPresentationCtrl',
                data: {
                    edit: false
                }
            })
            .state('tour.edition', {
                url: '/edit',
                templateUrl: 'app/tour.presentation/tour.presentation.html',
                controller: 'TourPresentationCtrl',
                data: {
                    edit: true
                }
            });
    });