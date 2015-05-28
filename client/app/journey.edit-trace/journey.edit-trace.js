(function(){
    'use strict';

    angular.module('globalbikerWebApp').config(function ($stateProvider) {
        $stateProvider
            .state('journey-create-trace', {
            url: '/journey/create-trace',
            templateUrl: 'app/journey.edit-trace/journey.edit-trace.html',
            controller: 'JourneyEditTraceCtrl'
        }) .state('journey-edit-trace', {
            url: '/journey/:reference/edit-trace',
            templateUrl: 'app/journey.edit-trace/journey.edit-trace.html',
            controller: 'JourneyEditTraceCtrl'
        });
    });

}());