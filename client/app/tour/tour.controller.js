(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourCtrl', TourCtrl);

    function TourCtrl(tour, $scope, $stateParams, $state, $q, bikeTourMapService) {

        // scope properties
        $scope.mapConfig = {};

        // scope methods

        // init method
        init();

        function init() {

            if (!tour) {
                $state.go('home');
            } else {
                $scope.tour = tour;

                showTourOnMap($scope.tour);
            }
        };

        function showTourOnMap(tour) {
            if (tour.steps) {
                var traceFeatures = bikeTourMapService.buildStepsTracesFeatures(tour.steps, {
                    style: {
                        color: '#34a0b4',
                        width: 3,
                        weight: 6,
                        opacity: 0.8
                    },
                    label: function (step) {
                        return getStepLabel(step);
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
        }

        function getStepLabel(step) {
            if (step.cityFrom.name === step.cityTo.name) {
                // same source & destination
                return step.cityFrom.name;
            } else {
                return 'From ' + step.cityFrom.name + ' to ' + step.cityTo.name;
            }
        };

    };
})();