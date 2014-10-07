'use strict';

angular.module('bikeTouringMapApp')
    .controller('TourDetailsCtrl', function ($scope, $stateParams, $state, $q, Auth, TourRepository, StepRepository, TourDetailsMapService, bikeTourMapService) {

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

                $scope.tourMapConfig = {
                    class: 'tour-map',
                    initialCenter: {
                        lat: 43.6,
                        lng: 1.45,
                        zoom: 10
                    },
                    callbacks: {
                        'map:created': function (eMap) {
                            var traceFeatures = bikeTourMapService.buildTourStepTracesFeatures(tour, {

                            });

                            eMap.addItemsToGroup(traceFeatures, {
                                name: 'Tracés des itinéraires',
                                control: true
                            });
                        }
                    }
                };


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
                                    TourDetailsMapService.updateStep(step.mapConfig, steps, step._id);

                                    $scope.autozoom(step, eMap);
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

            $scope.loadTour().catch(function (err) {
                $scope.redirectOnError();
            });
        };

        $scope.init();
    });