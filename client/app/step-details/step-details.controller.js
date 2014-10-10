'use strict';

angular.module('bikeTouringMapApp')
    .controller('StepDetailsCtrl', function ($scope, $stateParams, $q, $timeout, Auth, TourRepository, StepRepository, InterestRepository, bikeTourMapService) {

        $scope.isAdmin = Auth.isAdmin;

        $scope.isAllowedToEdit = function (tour) {
            if (tour && Auth.isLoggedIn() && (Auth.isAdmin() || tour.userId === Auth.getCurrentUser()._id)) {
                return true;
            }
            return false;
        }

        $scope.redirectOnError = function () {
            // redirect to 'toulouse' page
            $state.go('toulouse', {}, {
                inherit: false
            });
        };

        $scope.loadTour = function (tourId) {

            var deffered = $q.defer();

            TourRepository.get({
                id: tourId
            }, function (tour) {
                $scope.tour = tour;
                deffered.resolve(tour);
            }, function (err) {
                deffered.reject(err);
            });

            return deffered.promise;
        }


        $scope.loadStep = function (stepId) {

            var deffered = $q.defer();

            StepRepository.get({
                id: stepId
            }, function (step) {
                $scope.step = step;
                deffered.resolve(step);
            }, function (err) {
                deffered.reject(err);
            });

            return deffered.promise;
        }
        $scope.loadInterests = function (stepId) {

            // retrieve interests
            var deffered = $q.defer();

            InterestRepository.getByStep({
                    stepId: stepId
                }, function (interests) {

                    $scope.interests = interests;
                    deffered.resolve(interests);

                },
                function (err) {
                    deffered.reject(err);
                });

            return deffered.promise;
        };

        $scope.loadMarkers = function (stepId) {
            var deffered = $q.defer();

            InterestRepository.searchAroundStep({
                    stepId: stepId,
                    distance: 200,
                    type: ['water-point', 'velotoulouse', 'interest', 'food', 'bike-shops', 'wc']
                }, function (markers) {
                    $scope.waterPoints = [];
                    $scope.velotoulouses = [];
                    $scope.wcs = [];

                    markers.reduce(function (o, marker) {
                        if (marker.type === 'water-point') {
                            $scope.waterPoints.push(marker);
                        } else if (marker.type === 'velotoulouse') {
                            $scope.velotoulouses.push(marker);
                        } else if (marker.type === 'wc') {
                            $scope.wcs.push(marker);
                        }

                    }, null);
                    deffered.resolve(markers);
                },
                function (err) {
                    deffered.reject(err);
                });

            return deffered.promise;
        }

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

            $scope.stepId = $stateParams.id

            $scope.loadStep($scope.stepId).then(function (step) {
                $scope.loadTour(step.tourId).then(function (step) {
                    $scope.loadInterests($scope.stepId).then(function (step) {
                        $scope.loadMarkers($scope.stepId).then(function (step) {});
                    });
                });
            });

            $scope.tourMapConfig = {
                class: 'tour-map',
                initialCenter: {
                    lat: 43.6,
                    lng: 1.45,
                    zoom: 10
                },
                callbacks: {
                    'map:created': function (eMap) {

                        $scope.$watch('step', function (step, old) {

                            if (step) {
                                var traceFeature = bikeTourMapService.buildStepTraceFeature(step, {
                                    style: {
                                        color: '#0c6f32',
                                        width: 3,
                                        weight: 8,
                                        opacity: 0.3
                                    },
                                    label: function (step) {
                                        return $scope.getStepLabel(step);
                                    }
                                });

                                eMap.addItemsToGroup([traceFeature], {
                                    name: 'Tracés de l\'itinéraires',
                                    control: true
                                });
                                $timeout(function () {
                                    eMap.config.control.fitBoundsFromGeometry(step.geometry);
                                }, 200);
                            }
                        });

                        $scope.$watch('waterPoints', function (markers, old) {
                            if (markers) {
                                eMap.addItemsToGroup(bikeTourMapService.buildInterestsFeatures(markers, {
                                    mode: 'light'
                                }), {
                                    name: 'Points d\'eau potable',
                                    control: true
                                });
                            }
                        });

                        $scope.$watch('velotoulouses', function (markers, old) {
                            if (markers) {
                                eMap.addItemsToGroup(bikeTourMapService.buildInterestsFeatures(markers, {
                                    mode: 'light'
                                }), {
                                    name: 'Réseau VéloToulouse',
                                    control: true
                                });
                            }
                        });

                        $scope.$watch('wcs', function (markers, old) {
                            if (markers) {
                                eMap.addItemsToGroup(bikeTourMapService.buildInterestsFeatures(markers, {
                                    mode: 'light'
                                }), {
                                    name: 'Toilettes',
                                    control: true
                                });
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
        };

        $scope.init();
    });