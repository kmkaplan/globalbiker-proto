'use strict';

angular.module('bikeTouringMapApp')
    .controller('TourDetailsCtrl', function ($scope, $stateParams, $state, $q, $timeout, Auth, TourRepository, StepRepository, TourDetailsMapService, bikeTourMapService, InterestRepository, LicenseRepository) {

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

        $scope.loadInterests = function (tourId) {

            // retrieve interests
            var deffered = $q.defer();

            InterestRepository.getByTour({
                    tourId: tourId
                }, function (interests) {

                    $scope.interests = interests;
                    deffered.resolve(interests);

                },
                function (err) {
                    deffered.reject(err);
                });

            return deffered.promise;
        };

        $scope.loadTour = function (tourId) {

            var deffered = $q.defer();

            StepRepository.getByTour({
                tourId: tourId
            }, function (steps) {
                
                console.error(steps.length);

                if (steps.length === 1) {
                    console.warn('Only one step: redirect to step details.');
                    $scope.openStep(steps[0]);
                    deffered.success('Only one step.');
                } else {

                    $scope.steps = steps;

                    TourRepository.get({
                        id: tourId
                    }, function (tour) {

                        $scope.tour = tour;

                        $scope.loadInterests(tourId);

                        deffered.resolve(tour);
                    }, function (err) {
                        // error loading tour steps
                        deffered.reject(err);
                    });

                }

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

        $scope.getStepLabel = function (step) {
            if (step.cityFrom.name === step.cityTo.name) {
                // same source & destination
                return step.cityFrom.name;
            } else {
                return 'From ' + step.cityFrom.name + ' to ' + step.cityTo.name;
            }
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
                                    },
                                    label: function (step) {
                                        return $scope.getStepLabel(step);
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
                                    name: 'Tracé des  l\'itinéraires',
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

                        $scope.$watch('interests', function (markers, old) {
                            if (markers) {
                                eMap.addItemsToGroup(bikeTourMapService.buildInterestsFeatures(markers, {
                                    mode: 'normal'
                                }), {
                                    name: 'Points d\'intérêt',
                                    control: true
                                });
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