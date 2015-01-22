'use strict';

angular.module('globalbikerWebApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('tour.edit-trace', {
                url: '/edit-trace',
                templateUrl: 'app/tour.edit-trace/tour.edit-trace.html',
                controller: 'TourEditTraceCtrl'
            });
    });