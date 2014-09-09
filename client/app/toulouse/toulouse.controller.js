'use strict';

angular.module('bikeTouringMapApp')
    .controller('ToulouseCtrl', function ($scope) {

        $scope.mapConfig = {
            class: 'toulouse-map',
            initialCenter: {
                lat: 43.6220,
                lng: 1.3850,
                zoom: 8
            },
            callbacks: {
                'map:created': function (eMap) {



                }
            }
        };


    });