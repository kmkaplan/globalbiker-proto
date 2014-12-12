(function () {
    'use strict';

    angular.module('globalbikerWebApp')
        .controller('TourDetailsCtrl', function ($scope, $stateParams, $state, $q, $timeout, Auth, TourRepository, StepRepository, TourDetailsMapService, bikeTourMapService, InterestRepository, LicenseRepository, tourLoaderService) {

            // scope properties
            $scope.isAdmin = Auth.isAdmin;
            $scope.mapConfig = {};
            $scope.inEdition = true;
            $scope.tinymceOptions = {
                height: '200px',
                menubar: false,
                toolbar: 'bold italic bullist numlist outdent indent removeformat subscript superscript'
            };

            // scope methods
            $scope.isAllowedToEdit = isAllowedToEdit;
            $scope.openStep = openStep;
            $scope.redirectOnError = redirectOnError;
            $scope.getStepLabel = getStepLabel;
            $scope.loadTour = loadTour;
            $scope.edit = edit;
            $scope.save = save;

            // init method
            init();

            function init() {

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

            function edit() {
                $scope.inEdition = true;
            }

            function save() {
                $scope.inEdition = false;
            }

            function isAllowedToEdit(tour) {
                if (tour && Auth.isLoggedIn() && (Auth.isAdmin() || tour.userId === Auth.getCurrentUser()._id)) {
                    return true;
                }
                return false;
            }

            function openStep(step) {
                $state.go('step-details', {
                    id: step._id
                }, {
                    inherit: false
                });
            }

            function redirectOnError() {
                // redirect to 'toulouse' page
                $state.go('toulouse', {}, {
                    inherit: false
                });
            };

            function getStepLabel(step) {
                if (step.cityFrom.name === step.cityTo.name) {
                    // same source & destination
                    return step.cityFrom.name;
                } else {
                    return 'From ' + step.cityFrom.name + ' to ' + step.cityTo.name;
                }
            };

            function loadTour() {

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

        });
})();