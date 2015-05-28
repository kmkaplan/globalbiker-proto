(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('JourneyEditStopoversCtrl', JourneyEditStopoversCtrl);

    function JourneyEditStopoversCtrl($scope, $stateParams, $state, $q, $timeout, Auth, securityService, DS, journeyFeaturesBuilderService, JourneyEditStopoversPatchService) {

        // scope properties
        $scope.mapConfig = {
            scrollWheelZoom: true
        };
        $scope.journey = {};
        $scope.saveInProgress = false;

        // scope methods
        $scope.goToNextStep = goToNextStep;
        $scope.goToPreviousStep = goToPreviousStep;

        //$scope.updateWaypointsAfterDelay = updateWaypointsAfterDelay;
        $scope.toggleStopover = function (wayPoint) {
            wayPoint.stopover = !wayPoint.stopover;
            // updateWaypointsAfterDelay($scope.journey);
        }
        $scope.isWorkInProgress = function () {
            return $scope.saveInProgress;
        };

        // init method
        init();

        function init() {

            if ($stateParams.reference) {
                // edit journey
                DS.find('journeys', $stateParams.reference).then(function (journey) {
                    $scope.journey = journey;

                    showJourneyOnMap(journey);

                }, function (err) {
                    $state.go('journey-create-trace');
                    console.error(err);
                });

            } else {
                console.log('Journey not specified: redirect to creation page.');
                $state.go('journey-create-trace');
            }

        };

        function goToPreviousStep() {

            $scope.saveInProgress = true;

            // save modifications
            JourneyEditStopoversPatchService.patchJourney($scope.journey).then(function (journey) {

                // go to previous page
                $state.go('journey-edit-trace', {
                    reference: journey.reference
                });

            }).finally(function () {
                $scope.saveInProgress = false;
            });
        }

        function goToNextStep() {

            $scope.saveInProgress = true;

            // save modifications
            JourneyEditStopoversPatchService.patchJourney($scope.journey).then(function (journey) {

                // go to next page
                $state.go('journey-view', {
                    reference: journey.reference
                });

            }).finally(function () {
                $scope.saveInProgress = false;
            });
        }

        function showJourneyOnMap(journey) {
            var features = journeyFeaturesBuilderService.buildFeatures(journey, {
                waypoints: true,
                steps: false
            });

            if (features.length !== 0) {

                var geometries = features.reduce(function (geometries, feature) {
                    geometries.push(feature.geometry);
                    return geometries;
                }, []);

                if (!journey.geo.cityFrom || !journey.geo.cityTo) {
                    // keep region geometry while departure and arrival are not set
                    geometries.push($scope.region.geometry);
                }

                $scope.mapConfig.items = features;

                $scope.mapConfig.bounds = {
                    geometry: geometries
                };

            }
        }

    }

})();