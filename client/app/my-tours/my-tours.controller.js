(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('MyToursCtrl', MyToursCtrl);

    function MyToursCtrl($scope, $state, Auth, DS, journeyFeaturesBuilderService) {

        // scope properties
        $scope.mapConfig = {
            scrollWheelZoom: true
        };
        $scope.journeys = null;

        // scope methods

        // init method
        init();

        function init() {

            // view all journeys
            DS.findAll('journeys', null, {bypassCache: true}).then(function (journeys) {
                $scope.journeys = journeys;

                showJourneysOnMap(journeys);

            }, function (err) {
                $state.go('home');
                console.error(err);
            });

        };

        function showJourneysOnMap(journeys) {
            var features = journeys.reduce(function(features, journey){
                features = features.concat(journeyFeaturesBuilderService.buildFeatures(journey));
                return features;
            }, []);

            if (features.length !== 0) {

                var geometries = features.reduce(function (geometries, feature) {
                    geometries.push(feature.geometry);
                    return geometries;
                }, []);

                $scope.mapConfig.items = features;

                $scope.mapConfig.bounds = {
                    geometry: geometries
                };

            }
        }


    }

}());