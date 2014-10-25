'use strict';

angular.module('globalbikerWebApp')
    .controller('StepDetailsCtrl', function ($scope, $stateParams, $q, $timeout, Auth, TourRepository, StepRepository, InterestRepository, bikeTourMapService, LicenseRepository, interestLoaderService, stepLoaderService) {

        $scope.isAdmin = Auth.isAdmin;

        $scope.isAllowedToEdit = function (tour) {
            if (tour && Auth.isLoggedIn() && (Auth.isAdmin() || tour.userId === Auth.getCurrentUser()._id)) {
                return true;
            }
            return false;
        }
        $scope.licenses = LicenseRepository.query();

        $scope.getLicense = function (photo) {
            if (!photo || !photo.licenseId) {
                return null;
            }
            var license = $scope.licenses.reduce(function (photoLicense, license) {
                    if (license._id === photo.licenseId) {
                        return license;
                    }
                    return photoLicense;
                },
                null);
            return license;
        }


        $scope.redirectOnError = function () {
            // redirect to 'toulouse' page
            $state.go('toulouse', {}, {
                inherit: false
            });
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

            stepLoaderService.loadStep($scope.stepId, {
                tour: {},
                step: {
                    distances: true,
                    interests: {
                        photos: true
                    }
                }
            }).then(function (step) {
                $scope.step = step;
                $scope.loadMarkers(step._id);
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
                                        color: '#34a0b4',
                                        width: 3,
                                        weight: 6,
                                        opacity: 0.8
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

                        $scope.$watch('step.interests', function (markers, old) {
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