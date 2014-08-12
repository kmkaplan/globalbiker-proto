'use strict';

angular.module('bikeTouringMapApp')
    .controller('RouteDetailsCtrl', function ($scope) {
        $scope.message = 'Hello';

       
        angular.extend($scope, {
            defaults: {
                // tileLayer: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
                tileLayer: 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg',
                scrollWheelZoom: true,
                maxZoom: 14
            },
            center: {
                lat: 43.3032,
                lng: 2.3648,
                zoom: 8
            }
        });

    });