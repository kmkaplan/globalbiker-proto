(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('JourneyEditTraceCtrl', JourneyEditTraceCtrl);

    function JourneyEditTraceCtrl($scope, $stateParams, $state, $q, $timeout, Auth, securityService, DS, featuresBuilderFileService, journeyFeaturesBuilderService, JourneyEditTracePatchService, directionsService) {

        // scope properties
        $scope.mapConfig = {
            scrollWheelZoom: true
        };
        $scope.regionReference = 'france';
        $scope.journey = {
            attributes: {},
            geo: {}
        };
        $scope.region;
        $scope.saveInProgress = false;
        $scope.loadingInProgress = false;
        $scope.itinaryCalculationInProgress = false;
        $scope.sortableWaypointsConfig = {
            animation: 150,
            handle: ".handle",
            onSort: function (evt) {
                onCityChanged('/geo/waypoints');
            }
        };
        $scope.newWaypoint = {};

        // scope methods
        $scope.isValidJourneyGeometry = isValidJourneyGeometry;
        $scope.onCityChanged = onCityChanged;
        $scope.updateTitleAfterDelay = updateTitleAfterDelay;
        $scope.removeWaypoint = removeWaypoint;
        $scope.addWaypoint = addWaypoint;
        $scope.isWorkInProgress = function () {
            return $scope.saveInProgress || $scope.itinaryCalculationInProgress || $scope.loadingInProgress;
        };
        // init method
        init();

        function init() {

            $scope.loadingInProgress = false;

            if ($stateParams.reference) {
                // edit journey
                DS.find('journeys', $stateParams.reference).then(function (journey) {
                    $scope.journey = journey;

                    showJourneyOnMap(journey);

                }, function (err) {
                    console.error(err);
                }).finally(function () {
                    $scope.loadingInProgress = false;
                });

            } else {
                // create journey
                DS.find('regions', $scope.regionReference).then(function (region) {
                    $scope.region = region;
                    $scope.mapConfig.bounds = {
                        geometry: region.geometry
                    };

                    $scope.journey.region = $scope.region._id;

                }, function (err) {
                    console.error(err);
                }).finally(function () {
                    $scope.loadingInProgress = false;
                });
            }

        };

        function onCityChanged(path) {
            var journey = $scope.journey;

            if (isValidJourneyGeometry(journey)) {

                // update journey geometry
                updateJourneyGeometry(journey).then(function (journey) {

                    if (!journey._id) {
                        // create journey
                        $scope.saveInProgress = true;
                        JourneyEditTracePatchService.createJourney(journey).then(function (journey) {
                            // go to edit existing journey page
                            $state.go('journey-edit-trace', {
                                reference: journey.reference
                            });
                        }).finally(function () {
                            $scope.saveInProgress = false;
                        });
                    } else {
                        // update map
                        showJourneyOnMap(journey);

                        // update journey
                        $scope.saveInProgress = true;
                        JourneyEditTracePatchService.patchJourneyByPath(journey, path).finally(function () {
                            $scope.saveInProgress = false;
                        });
                    }

                });
            } else {
                // update map
                showJourneyOnMap(journey);
            }
        }

        function addWaypoint(city) {
            var journey = $scope.journey;
            if (!journey.geo.waypoints) {
                journey.geo.waypoints = [];
            }
            var newWaypoint = {
                type: 'transit',
                city: $scope.newWaypoint.city
            };
            journey.geo.waypoints.push(newWaypoint);
            // reset city
            $scope.newWaypoint.city = '';
            onCityChanged('/geo/waypoints');
        }

        function removeWaypoint(wayPoint, index) {
            var journey = $scope.journey;

            journey.geo.waypoints.splice(index, 1);

            // update journey geometry
            updateJourneyGeometry(journey).then(function (journey) { // update map
                showJourneyOnMap(journey);

                // update journey
                $scope.saveInProgress = true;
                JourneyEditTracePatchService.patchJourneyByPath(journey, '/geo/waypoints').finally(function () {
                    $scope.saveInProgress = false;
                });

            });
        }

        function updateTitleAfterDelay(journey) {
            if ($scope.titleUpdateDelayTimer) {
                $timeout.cancel($scope.titleUpdateDelayTimer);
                $timeout.cancel($scope.titleUpdateDelayTimer);
            }
            $scope.titleUpdateDelayTimer = $timeout(function () {
                updateTitle(journey);
            }, 2000);
        }

        function isValidJourneyGeometry(journey) {
            if (journey && journey.geo.cityTo && journey.geo.cityFrom && journey.geo.cityTo.geometry && journey.geo.cityFrom.geometry) {
                return true;
            }
            return false;
        }

        function updateJourneyGeometry(journey) {

            var deffered = $q.defer();

            if (isValidJourneyGeometry(journey)) {
                // geometry has been updated
                $scope.itinaryCalculationInProgress = true;

                var waypointsGeometries = [];

                if (journey.geo.waypoints) {
                    waypointsGeometries = journey.geo.waypoints.reduce(function (waypointsGeometries, point) {
                        if (point && point.city && point.city.geometry) {
                            waypointsGeometries.push(point.city.geometry);
                        }
                        return waypointsGeometries;
                    }, []);
                }

                directionsService.getDirections(journey.geo.cityFrom.geometry, journey.geo.cityTo.geometry, waypointsGeometries)
                    .then(function (geometry) {
                        // success
                        journey.geo.geometry = geometry;
                        deffered.resolve(journey);
                    }, function (err) {
                        // error
                        console.error(err);
                    }).finally(function () {
                        $scope.itinaryCalculationInProgress = false;
                    });
            } else {
                deffered.resolve(journey);
            }
            return deffered.promise;
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