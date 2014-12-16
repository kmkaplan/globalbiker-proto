'use strict';

angular.module('globalbikerWebApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('tour.presentation', {
                url: '/presentation',
                templateUrl: 'app/tour.presentation/tour.presentation.html',
                controller: 'TourPresentationCtrl'
            });
    });