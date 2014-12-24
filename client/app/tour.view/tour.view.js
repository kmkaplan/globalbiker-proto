'use strict';

angular.module('globalbikerWebApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('tour.view', {
                url: '/',
                templateUrl: 'app/tour.view/tour.view.html',
                controller: 'TourViewCtrl',
                data: {
                    edit: false
                }
            })
    });