(function(){
    'use strict';

    angular.module('globalbikerWebApp').config(function ($stateProvider) {
        $stateProvider
            .state('journey-edit-stopovers', {
            url: '/journey/:reference/edit-stopovers',
            templateUrl: 'app/journey.edit-stopovers/journey.edit-stopovers.html',
            controller: 'JourneyEditStopoversCtrl'
        });
    });

}());