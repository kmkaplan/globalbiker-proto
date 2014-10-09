'use strict';

angular.module('bikeTouringMapApp')
    .controller('TourDetailsCtrl', function ($scope, $stateParams, $state, $q, $timeout, Auth, TourRepository, StepRepository, TourDetailsMapService, bikeTourMapService, InterestRepository) {

        $scope.isAdmin = Auth.isAdmin;

        $scope.isAllowedToEdit = function (tour) {
            if (tour && Auth.isLoggedIn() && (Auth.isAdmin() || tour.userId === Auth.getCurrentUser()._id)) {
                return true;
            }
            return false;
        }

        $scope.autozoom = function (step, eMap) {
            var points = [];

            if (step.cityFrom) {
                points.push(step.cityFrom);
            }
            if (step.cityTo) {
                points.push(step.cityTo);
            }

            if (points.length > 1) {
                if (eMap) {
                    eMap.config.control.fitBoundsFromPoints(points, 0.2);
                }
            }
        };

        $scope.loadTour = function () {

            var deffered = $q.defer();

            TourRepository.get({
                id: $scope.tourId
            }, function (tour) {
                $scope.tour = tour;

                InterestRepository.searchAroundTour({
                        tourId: tour._id,
                        type: 'water-point',
                        distance: 200
                    },
                    function (waterPoints) {
                        $scope.waterPoints = waterPoints;
                    }, function () {});

                
                InterestRepository.searchAroundTour({
                        tourId: tour._id,
                        type: 'velotoulouse',
                        distance: 200
                    },
                    function (velotoulouse) {
                        $scope.velotoulouse = velotoulouse;
                    }, function () {});
                
                StepRepository.getByTour({
                    tourId: $scope.tourId
                }, function (steps) {
                    $scope.steps = steps;

                    steps.reduce(function (output, step) {

                        step.mapConfig = {
                            class: 'step-map',
                            initialCenter: {
                                lat: 43.6,
                                lng: 1.45,
                                zoom: 10
                            },
                            callbacks: {
                                'map:created': function (eMap) {
                                    var traceFeature = bikeTourMapService.buildStepTraceFeature(step, {
                                        style: {
                                            color: '#0c6f32',
                                            width: 3,
                                            weight: 8,
                                            opacity: 0.5
                                        }
                                    });

                                    eMap.addItemsToGroup([traceFeature], {
                                        name: 'Tracé de l\'itinéraire',
                                        control: true
                                    });


                                    $timeout(function () {
                                        eMap.config.control.fitBoundsFromGeometry(step.geometry);
                                    }, 200);


                                }
                            }
                        };
                    }, []);


                    deffered.resolve(tour);
                }, function (err) {
                    // error loading tour steps
                    deffered.reject(err);
                });

            }, function (err) {
                // error loading tour
                deffered.reject(err);
            });

            return deffered.promise;
        }

        $scope.redirectOnError = function () {
            // redirect to 'toulouse' page
            $state.go('toulouse', {}, {
                inherit: false
            });
        };

        $scope.init = function () {

            if (!$stateParams.id) {
                $scope.redirectOnError();
                return;
            }

            $scope.tourId = $stateParams.id

            $scope.tourMapConfig = {
                class: 'tour-map',
                initialCenter: {
                    lat: 43.6,
                    lng: 1.45,
                    zoom: 10
                },
                callbacks: {
                    'map:created': function (eMap) {

                        $scope.$watch('steps', function (steps, old) {

                            if (steps) {
                                var traceFeatures = bikeTourMapService.buildStepsTracesFeatures(steps, {
                                    style: {
                                        color: '#0c6f32',
                                        width: 3,
                                        weight: 8,
                                        opacity: 0.3
                                    }
                                });

                                eMap.addItemsToGroup(traceFeatures, {
                                    name: 'Tracés des itinéraires',
                                    control: true
                                });
                                var geometries = steps.reduce(function (geometries, step) {
                                    geometries.push(step.geometry);
                                    return geometries;
                                }, []);
                                $timeout(function () {
                                    eMap.config.control.fitBoundsFromGeometries(geometries);
                                }, 200);
                            }
                        });

                        $scope.$watch('waterPoints', function (waterPoints, old) {
                            if (waterPoints) {
                                eMap.addItemsToGroup(bikeTourMapService.buildInterestsFeatures(waterPoints, {
                                    mode: 'light',
                                    radius: 3,
                                    weight: 2
                                }), {
                                    name: 'Points d\'eau potable',
                                    control: true
                                });
                            }
                        });
                        
                         $scope.$watch('velotoulouse', function (velotoulouse, old) {
                            if (velotoulouse) {
                                eMap.addItemsToGroup(bikeTourMapService.buildInterestsFeatures(velotoulouse, {
                                    mode: 'light',
                                    radius: 3,
                                    weight: 2
                                }), {
                                    name: 'Stations vélo Toulouse',
                                    control: true
                                });
                            }
                        });
                    }
                }
            };

            $scope.loadTour().catch(function (err) {
                $scope.redirectOnError();
            });
        };

        $scope.init();
    });