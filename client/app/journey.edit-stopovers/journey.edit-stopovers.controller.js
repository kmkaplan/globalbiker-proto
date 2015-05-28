(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('JourneyEditStopoversCtrl', JourneyEditStopoversCtrl);

    function JourneyEditStopoversCtrl($scope, $stateParams, $state, $q, $timeout, Auth, securityService, DS, directionsService, featuresBuilderFileService, tourFeaturesBuilderService, interestsMarkerBuilderService, waypointsMarkerBuilderService, JourneyEditStopoversTourPatchService) {

        // scope properties
        $scope.mapConfig = {
            scrollWheelZoom: true
        };
        $scope.tour = {};
        $scope.saveInProgress = false;

        // scope methods
        $scope.goToNextStep = goToNextStep;
        $scope.goToPreviousStep = goToPreviousStep;

        //$scope.updateWaypointsAfterDelay = updateWaypointsAfterDelay;
        $scope.toggleStopover = function (wayPoint) {
            wayPoint.stopover = !wayPoint.stopover;
            // updateWaypointsAfterDelay($scope.tour);
        }
        $scope.isWorkInProgress = function () {
            return $scope.saveInProgress;
        };

        // init method
        init();

        function init() {

            if ($stateParams.tourReference) {
                // edit tour
                DS.find('tours', $stateParams.tourReference).then(function (tour) {
                    $scope.tour = tour;

                    showTourOnMap(tour);

                }, function (err) {
                    $state.go('journey-create-trace');
                    console.error(err);
                });

            } else {
                console.log('Tour not specified: redirect to creation page.');
                $state.go('journey-create-trace');
            }

        };

        function goToPreviousStep() {

            $scope.saveInProgress = true;

            // save modifications
            JourneyEditStopoversTourPatchService.patchTour($scope.tour).then(function (tour) {

                // go to previous page
                $state.go('journey-edit-trace', {
                    tourReference: tour.reference
                });

            }).finally(function () {
                $scope.saveInProgress = false;
            });
        }

        function goToNextStep() {

            $scope.saveInProgress = true;

            // save modifications
            JourneyEditStopoversTourPatchService.patchTour($scope.tour).then(function (tour) {

                // go to next page
                $state.go('tour.edit', {
                    reference: tour.reference
                });

            }).finally(function () {
                $scope.saveInProgress = false;
            });
        }

        function showTourOnMap(tour) {
            var features = [];

            // no step geometry: display tour geometry instead
            if (tour.geo.geometry) {
                var feature = tourFeaturesBuilderService.build(tour);
                features.push(feature);
            }

            if (tour.geo.cityFrom) {
                var feature = interestsMarkerBuilderService.buildDeparture(tour.geo.cityFrom);
                features.push(feature);
            }

            if (tour.geo.cityTo) {
                var feature = interestsMarkerBuilderService.buildArrival(tour.geo.cityTo);
                features.push(feature);
            }

            if (tour.geo.waypoints) {
                features = features.concat(waypointsMarkerBuilderService.buildAll(tour.geo.waypoints));
            }

            if (features.length !== 0) {

                var geometries = features.reduce(function (geometries, feature) {
                    geometries.push(feature.geometry);
                    return geometries;
                }, []);

                if (!tour.geo.cityFrom || !tour.geo.cityTo) {
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