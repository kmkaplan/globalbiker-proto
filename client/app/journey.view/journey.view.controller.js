(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('JourneyViewCtrl', JourneyViewCtrl);

    function JourneyViewCtrl($scope, $stateParams, $state, $q, $timeout, Auth, securityService, DS, directionsService, journeyFeaturesBuilderService) {

        // scope properties
        $scope.mapConfig = {
            scrollWheelZoom: true
        };
        $scope.journey = null;

        // scope methods

        // init method
        init();

        function init() {

            if ($stateParams.reference) {
                // view journey
                DS.find('journeys', $stateParams.reference).then(function (journey) {
                    $scope.journey = journey;

                    showJourneyOnMap(journey);

                }, function (err) {
                    $state.go('home');
                    console.error(err);
                });

            } else {
                console.log('Journey not specified: redirect to home page.');
                $state.go('home');
            }

        };

        function showJourneyOnMap(journey) {
            var features = [];

            var features = journeyFeaturesBuilderService.buildFeatures(journey);

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

})();