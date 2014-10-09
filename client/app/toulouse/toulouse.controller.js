'use strict';

angular.module('bikeTouringMapApp')
    .controller('ToulouseCtrl', function ($scope, $q, $state, Auth, TourRepository, StepRepository, SteppointRepository, InterestRepository, ToulouseMapService, BikelaneRepository, bikeTourMapService) {

        $scope.mapConfig = {
            class: 'toulouse-map',
            initialCenter: {
                lat: 43.6,
                lng: 1.45,
                zoom: 11
            },
            callbacks: {
                'map:created': function (eMap) {

                    $scope.$watch('bikelanes', function (bikelanes, old) {
                        if (bikelanes) {
                            eMap.addItemsToGroup(bikeTourMapService.buildBikelanesFeatures(bikelanes), {
                                name: 'Pistes cyclables',
                                control: true,
                                show: false
                            });
                        }
                    });

                    $scope.$watch('interests', function (interests, old) {
                        if (interests) {
                            eMap.addItemsToGroup(bikeTourMapService.buildInterestsFeatures(interests), {
                                name: 'Principaux points d\'intérêt',
                                control: true
                            });
                        }
                    });

                    $scope.$watch('waterPoints', function (waterPoints, old) {
                        if (waterPoints) {
                            eMap.addItemsToGroup(bikeTourMapService.buildInterestsFeatures(waterPoints), {
                                name: 'Points d\'eau potable',
                                control: true
                            });
                        }
                    });

                    $scope.$watch('tours', function (tours, old) {
                        if (tours) {
                            // ToulouseMapService.updateTours($scope.mapConfig, tours);

                            var traceFeatures = bikeTourMapService.buildToursStepTracesFeatures(tours, {
                                style: {
                                    // color: 'red'
                                },
                                overStyle: {
                                    color: 'green',
                                    opacity: 0.8
                                },
                                callbacks: {
                                    'click': function (step) {
                                        $state.go('tour-details', {
                                            id: step.tourId
                                        }, {
                                            inherit: false
                                        });
                                    }
                                }
                            });

                            eMap.addItemsToGroup(traceFeatures, {
                                name: 'Tracés des itinéraires',
                                control: true
                            });

                        }
                    });

                    $scope.$watch('mapConfig.configuration', function (configuration, old) {
                        if ($scope.tours) {
                            ToulouseMapService.updateTours($scope.mapConfig, $scope.tours);
                        }
                    }, true);
                },
                'interest:clicked': function (interest, eMap, item, itemLayer, e) {
                    if (Auth.isAdmin()) {
                        if (interest.priority === 1) {
                            interest.priority = 0;
                        } else {
                            interest.priority = 1;
                        }
                        interest.$update(function () {
                            ToulouseMapService.updateTours($scope.mapConfig, $scope.tours);
                        });
                    }
                },
                'step:clicked': function (step, eMap, item, itemLayer, e) {
                    $state.go('tour-details', {
                        id: step.tourId
                    }, {
                        inherit: false
                    });
                }
            },
            configuration: {
                interests: {
                    visible: {
                        show: true
                    },
                    invisible: {
                        show: false
                    }
                }
            }
        };

        $scope.loadPointsOfInterests = function () {
            $scope.loadingInProgress = true;
            InterestRepository.search({
                    latitude: 43.61,
                    longitude: 1.44,
                    maxDistance: 10000,
                    type: 'interest'
                },

                function (interests) {
                    $scope.interests = interests;
                    InterestRepository.search({
                            latitude: 43.61,
                            longitude: 1.44,
                            maxDistance: 10000,
                            type: 'water-point'
                        },

                        function (waterPoints) {
                            $scope.waterPoints = waterPoints;
                            $scope.loadingInProgress = false;
                        }, function () {
                            $scope.loadingInProgress = false;
                        });
                }, function () {
                    $scope.loadingInProgress = false;
                });

        };

        /*  $scope.loadStepsPoints = function (steps) {
            var defferedArray = steps.reduce(function (defferedArray, step) {

                var deffered = $q.defer();

                SteppointRepository.getByStep({
                        stepId: step._id
                    },
                    function (steppoints) {
                        step.points = steppoints;

                        deffered.resolve(step);

                    }, function (err) {
                        deffered.reject(err);
                    });

                defferedArray.push(deffered.promise);
                return defferedArray;

            }, []);

            return $q.all(defferedArray);
        };*/

        /* $scope.loadStepsInterests = function (steps) {
            var defferedArray = steps.reduce(function (defferedArray, step) {

                var deffered = $q.defer();

                InterestRepository.getByStep({
                        stepId: step._id
                    },
                    function (interests) {
                        step.interests = interests;

                        deffered.resolve(step);

                    }, function (err) {
                        deffered.reject(err);
                    });

                defferedArray.push(deffered.promise);
                return defferedArray;

            }, []);

            return $q.all(defferedArray);
        };
*/
        $scope.loadToursSteps = function (tours) {
            var defferedArray = tours.reduce(function (defferedArray, tour) {

                var deffered = $q.defer();

                StepRepository.getByTour({
                        tourId: tour._id
                    },
                    function (steps) {
                        tour.steps = steps;

                        //   $scope.loadStepsPoints(steps).then(function () {

                        //$scope.loadStepsInterests(steps).then(function () {

                        deffered.resolve(steps);
                        //   });
                        //    });

                    }, function (err) {
                        deffered.reject(err);
                    });

                defferedArray.push(deffered.promise);
                return defferedArray;

            }, []);

            return $q.all(defferedArray);
        };

        $scope.loadTours = function () {

            var deffered = $q.defer();

            TourRepository.query(function (tours) {

                $scope.loadToursSteps(tours).then(function () {
                        $scope.tours = tours;

                        deffered.resolve(tours);
                    },
                    function (err) {
                        deffered.reject(err);
                    });
            });

            return deffered.promise;
        };

        $scope.loadBikelanes = function () {
            $scope.loadingInProgress = true;
            BikelaneRepository.search({
                latitude: 43.61,
                longitude: 1.44,
                maxDistance: 5000
            }, function (bikelanes) {
                $scope.bikelanes = bikelanes;
                $scope.loadingInProgress = false;
            }, function () {
                $scope.loadingInProgress = false;
            });
        };
        $scope.init = function () {
            $scope.isAdmin = Auth.isAdmin;
            $scope.loadTours().then(function () {
                $scope.loadPointsOfInterests();
                $scope.loadBikelanes();
            });
        }

        $scope.init();

    });