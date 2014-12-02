'use strict';

angular.module('globalbikerWebApp')
    .controller('TourDetailsCtrl', function ($scope, $stateParams, $state, $q, $timeout, Auth, TourRepository, StepRepository, TourDetailsMapService, bikeTourMapService, InterestRepository, LicenseRepository, tourLoaderService) {

        $scope.isAdmin = Auth.isAdmin;

        $scope.isAllowedToEdit = function (tour) {
            if (tour && Auth.isLoggedIn() && (Auth.isAdmin() || tour.userId === Auth.getCurrentUser()._id)) {
                return true;
            }
            return false;
        }

        $scope.openStep = function (step) {
            $state.go('step-details', {
                id: step._id
            }, {
                inherit: false
            });
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

        $scope.redirectOnError = function () {
            // redirect to 'toulouse' page
            $state.go('toulouse', {}, {
                inherit: false
            });
        };

        $scope.getStepLabel = function (step) {
            if (step.cityFrom.name === step.cityTo.name) {
                // same source & destination
                return step.cityFrom.name;
            } else {
                return 'From ' + step.cityFrom.name + ' to ' + step.cityTo.name;
            }
        };

        $scope.loadTour = function () {

            return tourLoaderService.loadTour($scope.tourId, {
                steps: {}
            }).then(function (tour) {

                if (tour.steps.length === 1) {
                    console.warn('Only one step: redirect to step details.');
                    $scope.openStep(tour.steps[0]);
                } else {
                    $scope.tour = tour;
                }
            });
        }

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

                        $scope.$watch('tour.steps', function (steps, old) {

                            if (steps) {
                                var traceFeatures = bikeTourMapService.buildStepsTracesFeatures(steps, {
                                    style: {
                                        color: '#34a0b4',
                                        width: 3,
                                        weight: 6,
                                        opacity: 0.8
                                    },
                                    label: function (step) {
                                        return $scope.getStepLabel(step);
                                    },
                                    tour: {
                                        bounds: {
                                            show: true
                                        }
                                    },
                                    callbacks: {
                                        'click': function (step) {
                                            $state.go('step-details', {
                                                id: step._id
                                            }, {
                                                inherit: false
                                            });
                                        }
                                    }
                                });

                                eMap.addItemsToGroup(traceFeatures, {
                                    name: 'Tracé de l\'itinéraire',
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
                    }
                }
            };

            $scope.loadTour($scope.tourId).catch(function (err) {
                $scope.redirectOnError();
            });
        };

        $scope.init();
    });