(function(){
    'use strict';

    angular.module('globalbikerWebApp').config(function ($stateProvider) {
        $stateProvider
            .state('journey-view', {
            url: '/journey/:reference/view',
            templateUrl: 'app/journey.view/journey.view.html',
            controller: 'JourneyViewCtrl'
        });
    });

}());
