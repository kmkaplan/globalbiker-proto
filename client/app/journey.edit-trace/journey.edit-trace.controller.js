(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('JourneyEditTraceCtrl', JourneyEditTraceCtrl);

    function JourneyEditTraceCtrl($scope, $stateParams, $state, $q, $timeout, Auth, securityService, DS, directionsService, featuresBuilderFileService, tourFeaturesBuilderService, interestsMarkerBuilderService, waypointsMarkerBuilderService, JourneyEditTraceTourPatchService) {

        // scope properties
        $scope.mapConfig = {
            scrollWheelZoom: true
        };
        $scope.regionReference = 'france';
        $scope.tour = {
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
        $scope.isValidTourGeometry = isValidTourGeometry;
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

            if ($stateParams.tourReference) {
                // edit tour
                DS.find('tours', $stateParams.tourReference).then(function (tour) {
                    $scope.tour = tour;

                    showTourOnMap(tour);

                }, function (err) {
                    console.error(err);
                }).finally(function () {
                    $scope.loadingInProgress = false;
                });

            } else {
                // create tour
                DS.find('regions', $scope.regionReference).then(function (region) {
                    $scope.region = region;
                    $scope.mapConfig.bounds = {
                        geometry: region.geometry
                    };

                    $scope.tour.region = $scope.region._id;

                }, function (err) {
                    console.error(err);
                }).finally(function () {
                    $scope.loadingInProgress = false;
                });
            }

        };

        function onCityChanged(path) {
            var tour = $scope.tour;

            if (isValidTourGeometry(tour)) {

                // update tour geometry
                updateTourGeometry(tour).then(function (tour) {

                    if (!tour._id) {
                        // create tour
                        $scope.saveInProgress = true;
                        JourneyEditTraceTourPatchService.createTour(tour).then(function (tour) {
                            // go to edit existing tour page
                            $state.go('journey-edit-trace', {
                                tourReference: tour.reference
                            });
                        }).finally(function () {
                            $scope.saveInProgress = false;
                        });
                    } else {
                        // update map
                        showTourOnMap(tour);

                        // update tour
                        $scope.saveInProgress = true;
                        JourneyEditTraceTourPatchService.patchTourByPath(tour, path).finally(function () {
                            $scope.saveInProgress = false;
                        });
                    }

                });
            } else {
                // update map
                showTourOnMap(tour);
            }
        }

        function addWaypoint(city) {
            var tour = $scope.tour;
            if (!tour.geo.waypoints) {
                tour.geo.waypoints = [];
            }
            var newWaypoint = {
                type: 'transit',
                city: $scope.newWaypoint.city
            };
            tour.geo.waypoints.push(newWaypoint);
            // reset city
            $scope.newWaypoint.city = '';
            onCityChanged('/geo/waypoints');
        }

        function removeWaypoint(wayPoint, index) {
            var tour = $scope.tour;

            tour.geo.waypoints.splice(index, 1);

            // update tour geometry
            updateTourGeometry(tour).then(function (tour) { // update map
                showTourOnMap(tour);

                // update tour
                $scope.saveInProgress = true;
                JourneyEditTraceTourPatchService.patchTourByPath(tour, '/geo/waypoints').finally(function () {
                    $scope.saveInProgress = false;
                });

            });
        }

        function updateTitleAfterDelay(tour) {
            if ($scope.titleUpdateDelayTimer) {
                $timeout.cancel($scope.titleUpdateDelayTimer);
            }
            $scope.titleUpdateDelayTimer = $timeout(function () {
                updateTitle(tour);
            }, 2000);
        }

        function isValidTourGeometry(tour) {
            if (tour && tour.geo.cityTo && tour.geo.cityFrom && tour.geo.cityTo.geometry && tour.geo.cityFrom.geometry) {
                return true;
            }
            return false;
        }

        function updateTourGeometry(tour) {

            var deffered = $q.defer();

            if (isValidTourGeometry(tour)) {
                // geometry has been updated
                $scope.itinaryCalculationInProgress = true;

                var waypointsGeometries = [];

                if (tour.geo.waypoints) {
                    waypointsGeometries = tour.geo.waypoints.reduce(function (waypointsGeometries, point) {
                        if (point && point.city && point.city.geometry) {
                            waypointsGeometries.push(point.city.geometry);
                        }
                        return waypointsGeometries;
                    }, []);
                }

                directionsService.getDirections(tour.geo.cityFrom.geometry, tour.geo.cityTo.geometry, waypointsGeometries)
                    .then(function (geometry) {
                        // success
                        tour.geo.geometry = geometry;
                        deffered.resolve(tour);
                    }, function (err) {
                        // error
                        console.error(err);
                    }).finally(function () {
                        $scope.itinaryCalculationInProgress = false;
                    });
            } else {
                deffered.resolve(tour);
            }
            return deffered.promise;
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