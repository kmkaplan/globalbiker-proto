'use strict';

angular.module('bikeTouringMapApp')
    .controller('ToulouseCtrl', function ($scope, $q, TourRepository, StepRepository, SteppointRepository, InterestRepository, ToulouseMapService) {

        $scope.mapConfig = {
            class: 'toulouse-map',
            initialCenter: {
                lat: 43.6220,
                lng: 1.3850,
                zoom: 9
            },
            callbacks: {
                'map:created': function (eMap) {

                    $scope.$watch('tours', function (tours, old) {
                        if (tours) {
                            ToulouseMapService.updateTours($scope.mapConfig, tours);
                        }

                    });

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
                    },
                    function (err) {
                        deffered.reject(err);
                    });
            });

            return deffered.promise;
        };

        $scope.init = function () {
            $scope.loadTours();
        }

        $scope.init();

    });