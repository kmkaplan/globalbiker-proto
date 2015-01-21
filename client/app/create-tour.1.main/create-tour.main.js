'use strict';

angular.module('globalbikerWebApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('create-tour.main', {
                url: '/main',
                templateUrl: 'app/create-tour.1.main/create-tour.main.html',
                controller: 'CreateTourMainCtrl'
            });
    });