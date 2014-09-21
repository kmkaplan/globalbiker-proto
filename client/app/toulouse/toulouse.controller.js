'use strict';

angular.module('bikeTouringMapApp')
    .controller('ToulouseCtrl', function ($scope, $q, $state, Auth, TourRepository, StepRepository, SteppointRepository, InterestRepository, ToulouseMapService, BikelaneRepository) {

        $scope.mapConfig = {
            class: 'toulouse-map',
            initialCenter: {
                lat: 43.6,
                lng: 1.45,
                zoom: 10
            },
            callbacks: {
                'map:created': function (eMap) {

                    $scope.$watch('tours', function (tours, old) {
                        if (tours) {
                            ToulouseMapService.updateTours($scope.mapConfig, tours);
                        }
                    });

                    $scope.$watch('bikelanes', function (bikelanes, old) {
                        if (bikelanes) {
                            ToulouseMapService.updateBikelanes($scope.mapConfig, bikelanes);
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

        $scope.loadStepsPoints = function (steps) {
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
        };

        $scope.loadStepsInterests = function (steps) {
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

        $scope.loadToursSteps = function (tours) {
            var defferedArray = tours.reduce(function (defferedArray, tour) {

                var deffered = $q.defer();

                StepRepository.getByTour({
                        tourId: tour._id
                    },
                    function (steps) {
                        tour.steps = steps;

                        $scope.loadStepsPoints(steps).then(function () {

                            $scope.loadStepsInterests(steps).then(function () {

                                deffered.resolve(steps);
                            });
                        });

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
            $scope.bikelanesLoading = true;
            BikelaneRepository.query(function (bikelanes) {

                $scope.bikelanes = bikelanes;

                $scope.bikelanesLoading = false;
            }, function () {
                $scope.bikelanesLoading = false;
            });
        };

        $scope.init = function () {
            $scope.isAdmin = Auth.isAdmin;
            $scope.loadTours().then(function () {
                $scope.loadBikelanes();
            });
        }

        $scope.init();

    });