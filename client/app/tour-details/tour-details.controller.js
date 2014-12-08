'use strict';

angular.module('globalbikerWebApp')
    .controller('TourDetailsCtrl', function ($scope, $stateParams, $state, $q, $timeout, Auth, TourRepository, StepRepository, TourDetailsMapService, bikeTourMapService, InterestRepository, LicenseRepository, tourLoaderService) {

        // scope properties
        $scope.isAdmin = Auth.isAdmin;
        $scope.mapConfig = {};

        // scope methods

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

            var deffered = $q.defer();

            tourLoaderService.loadTour($scope.tourId, {
                steps: {}
            }).then(function (tour) {

                if (tour.steps.length === 1) {
                    console.warn('Only one step: redirect to step details.');
                    $scope.openStep(tour.steps[0]);

                    deffered.reject('Only one step.');
                } else {
                    $scope.tour = tour;
                    deffered.resolve(tour);
                }
            });

            return deffered.promise;
        }

        $scope.init = function () {

            if (!$stateParams.id) {
                $scope.redirectOnError();
                return;
            }

            $scope.tourId = $stateParams.id

            $scope.loadTour($scope.tourId).then(function (tour) {

                if (tour.steps) {
                    var traceFeatures = bikeTourMapService.buildStepsTracesFeatures(tour.steps, {
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

                    var geometries = tour.steps.reduce(function (geometries, step) {
                        geometries.push(step.geometry);
                        return geometries;
                    }, []);

                    if (traceFeatures) {
                        $scope.mapConfig.items = traceFeatures;

                        $scope.mapConfig.bounds = {
                            geometry: geometries
                        };
                    }

                }

            }).catch(function (err) {
                $scope.redirectOnError();
            });
        };

        $scope.init();
    });