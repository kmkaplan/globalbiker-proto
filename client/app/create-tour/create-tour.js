'use strict';

angular.module('globalbikerWebApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('create-tour', {
                abstract: true,
                url: '/create-tour',
                templateUrl: 'app/create-tour/create-tour.html',
                controller: 'CreateTourCtrl',
                resolve: {
                    tour: function ($stateParams, $q) {
                        return {};
                    }
                }
            });
    });