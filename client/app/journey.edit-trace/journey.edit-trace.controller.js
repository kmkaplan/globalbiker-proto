(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('JourneyEditTraceCtrl', JourneyEditTraceCtrl);

    function JourneyEditTraceCtrl($scope, $stateParams, $state, $q, $timeout, Auth, securityService, featuresBuilderFileService, tourFeaturesBuilderService, interestsMarkerBuilderService, DS, directionsService) {

        // scope properties
        $scope.mapConfig = {
            scrollWheelZoom: true
        };
        $scope.regionReference = 'france';
        $scope.tour = {};
        $scope.region;
        $scope.saveInProgress = false;
        $scope.itinaryCalculationInProgress = false;
        $scope.sortableWayPointsConfig = {
            animation: 150,
            handle: ".handle",
            onSort: function (evt) {
                onCityChanged('/wayPoints');
            }
        };
        $scope.newWaypoint = {};

        // scope methods
        $scope.isValidTourGeometry = isValidTourGeometry;
        $scope.onCityChanged = onCityChanged;
        $scope.updateTitleAfterDelay = updateTitleAfterDelay;
        $scope.removeWayPoint = removeWayPoint;
        $scope.addWayPoint = addWayPoint;
        $scope.isWorkInProgress = function () {
            return $scope.saveInProgress || $scope.itinaryCalculationInProgress;
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
                // create tour
                DS.find('regions', $scope.regionReference).then(function (region) {
                    $scope.region = region;
                    $scope.mapConfig.bounds = {
                        geometry: region.geometry
                    };

                }, function (err) {
                    console.error(err);
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
                        createTour(tour).then(function (tour) {
                            // go to edit existing tour page
                            $state.go('journey-edit-trace', {
                                tourReference: tour.reference
                            });
                        });
                    } else {
                        // update map
                        showTourOnMap(tour);

                        // update tour
                        updateTour(tour, path);
                    }

                });
            }
        }

        function addWayPoint(city) {
            var tour = $scope.tour;
            if (!tour.wayPoints) {
                tour.wayPoints = [];
            }
            tour.wayPoints.push(angular.copy($scope.newWaypoint));
            $scope.newWaypoint.city = '';
            onCityChanged('/wayPoints');
        }

        function removeWayPoint(wayPoint, index) {
            var tour = $scope.tour;

            tour.wayPoints.splice(index, 1);

            // update tour geometry
            updateTourGeometry(tour).then(function (tour) { // update map
                showTourOnMap(tour);

                // update tour
                updateTour(tour, '/wayPoints');

            });
        }

        function createTour(tour) {
            var deffered = $q.defer();

            // create tour
            $scope.saveInProgress = true;

            tour.region = $scope.region._id;

            if (!tour.title || tour.title.trim().length === 0) {
                tour.title = 'Voyage de ' + tour.cityFrom.name + ' à ' + tour.cityTo.name;
            }

            DS.create('tours', tour).then(function (tour) {
                deffered.resolve(tour);
            }, function (err) {
                console.error(err);
                deffered.reject(err);
            }).finally(function () {
                $scope.saveInProgress = false;
            });

            return deffered.promise;
        }

        function updateTitleAfterDelay(tour) {
            if ($scope.titleUpdateDelayTimer){
                $timeout.cancel($scope.titleUpdateDelayTimer);
            }
            $scope.titleUpdateDelayTimer = $timeout(function () {
                updateTitle(tour);
            }, 2000);
        }

        function updateTitle(tour) {
            var deffered = $q.defer();

            var patches = [{
                op: 'replace',
                path: '/title',
                value: tour.title
            }];

            $scope.saveInProgress = true;

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

        function updateTour(tour, path) {
            var deffered = $q.defer();
            var patch = null;

            if (path === '/wayPoints') {

                var wayPoints;
                if (tour.wayPoints) {
                    // keep only valid way points
                    wayPoints = tour.wayPoints.reduce(function (wayPoints, wayPoint) {
                        if (wayPoint && wayPoint.city && wayPoint.city.geometry) {
                            wayPoints.push(wayPoint);
                        }
                        return wayPoints;
                    }, []);
                } else {
                    wayPoints = [];
                }

                patch = {
                    op: 'replace',
                    path: path,
                    value: wayPoints
                };
            } else if (path === '/cityFrom') {
                patch = {
                    op: 'replace',
                    path: path,
                    value: tour.cityFrom
                };
            } else if (path === '/cityTo') {
                patch = {
                    op: 'replace',
                    path: path,
                    value: tour.cityTo
                };
            } else {
                console.error('Invalid path "%s".', path);
                deffered.reject(new Error('Invalid path.'));
            }

            if (patch !== null) {

                var patches = [patch, {
                    op: 'replace',
                    path: '/geometry',
                    value: tour.geometry
                }];

                $scope.saveInProgress = true;

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
            }
            return deffered.promise;
        }

        function isValidTourGeometry(tour) {
            if (tour && tour.cityTo && tour.cityFrom && tour.cityTo.geometry && tour.cityFrom.geometry) {
                return true;
            }
            return false;
        }

        function updateTourGeometry(tour) {

            var deffered = $q.defer();

            if (isValidTourGeometry(tour)) {
                // geometry has been updated
                $scope.itinaryCalculationInProgress = true;

                var wayPointsGeometries = [];

                if (tour.wayPoints) {
                    wayPointsGeometries = tour.wayPoints.reduce(function (wayPointsGeometries, point) {
                        if (point && point.city && point.city.geometry) {
                            wayPointsGeometries.push(point.city.geometry);
                        }
                        return wayPointsGeometries;
                    }, []);
                }

                directionsService.getDirections(tour.cityFrom.geometry, tour.cityTo.geometry, wayPointsGeometries)
                    .then(function (geometry) {
                        // success
                        tour.geometry = geometry;
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