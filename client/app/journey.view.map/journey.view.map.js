(function(){
    'use strict';

    angular.module('globalbikerWebApp').config(function ($stateProvider) {
        $stateProvider
            .state('journey-view-map', {
            url: '/journey/:reference/view/map',
            templateUrl: 'app/journey.view.map/journey.view.map.html',
            controller: 'JourneyViewMapCtrl'
        });
    });

}());
