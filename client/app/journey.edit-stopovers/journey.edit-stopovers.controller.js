(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('JourneyEditStopoversCtrl', JourneyEditStopoversCtrl);

    function JourneyEditStopoversCtrl($scope, $stateParams, $state, $q, $timeout, Auth, securityService, DS, directionsService, featuresBuilderFileService, tourFeaturesBuilderService, interestsMarkerBuilderService, waypointsMarkerBuilderService) {

        // scope properties
        $scope.mapConfig = {
            scrollWheelZoom: true
        };
        $scope.tour = {};
        $scope.saveInProgress = false;
        $scope.autoSaveIsPlanned = false;

        // scope methods
        $scope.updateWayPointsAfterDelay = updateWayPointsAfterDelay;
        $scope.toggleStopover = function (wayPoint) {
            wayPoint.stopover = !wayPoint.stopover;
            updateWayPointsAfterDelay($scope.tour);
        }
        $scope.isWorkInProgress = function () {
            return $scope.saveInProgress ;
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
                    console.error(err);
                });

            } else {
                console.log('Tour not specified: redirect to creation page.');
                $state.go('journey-create-trace');
            }

        };

        function updateWayPointsAfterDelay(tour) {
            $scope.autoSaveIsPlanned = true;
            showTourOnMap(tour);

            if ($scope.updateWayPointsAfterDelayTimer) {
                $timeout.cancel($scope.updateWayPointsAfterDelayTimer);
            }
            $scope.updateWayPointsAfterDelayTimer = $timeout(function () {
                updateWayPoints(tour);
            }, 2000);
        }

        function updateWayPoints(tour) {
            var deffered = $q.defer();
            var patch = {
                op: 'replace',
                path: '/wayPoints',
                value: tour.wayPoints
            };

            var patches = [patch];

            $scope.saveInProgress = true;
            $scope.autoSaveIsPlanned = false;

            DS.update('tours', tour._id, {
                patches: patches
            }, {
                method: 'patch'
            }).then(function (tour) {
                // success
                deffered.resolve(tour);
            }, function (err) {
                console.error(err);
                deffered.reject(err);
            }).finally(function () {
                $scope.saveInProgress = false;
            });
            return deffered.promise;
        }


        function showTourOnMap(tour) {
            var features = [];

            // no step geometry: display tour geometry instead
            if (tour.geometry) {
                var feature = tourFeaturesBuilderService.build(tour);
                features.push(feature);
            }

            if (tour.cityFrom) {
                var feature = interestsMarkerBuilderService.buildDeparture(tour.cityFrom);
                features.push(feature);
            }

            if (tour.cityTo) {
                var feature = interestsMarkerBuilderService.buildArrival(tour.cityTo);
                features.push(feature);
            }

            if (tour.wayPoints) {
                features = features.concat(waypointsMarkerBuilderService.buildAll(tour.wayPoints));
            }

            if (features.length !== 0) {

                var geometries = features.reduce(function (geometries, feature) {
                    geometries.push(feature.geometry);
                    return geometries;
                }, []);

                if (!tour.cityFrom || !tour.cityTo) {
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