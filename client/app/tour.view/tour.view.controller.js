(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourViewCtrl', TourViewCtrl);

    function TourViewCtrl(tour, $scope, $stateParams, $state, $q, $timeout, Auth, bikeTourMapService, securityService, interestsMarkerBuilderService, PhotoRepository) {

        // scope properties
        $scope.mapConfig = {};
        $scope.securityService = securityService;
        
        // scope methods
        $scope.editTour = editTour;

        // init method
        init();

        function init() {

            console.log('init');

            if (!tour) {
                $state.go('home');
            } else {
                $scope.tour = tour;

                showTourOnMap(tour);

            }
        };


        function editTour(tour) {
            // update location without reloading
            $state.go('tour.edit', $stateParams);
        }

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
                            $state.go('tour.step.view', {
                                stepReference: step.reference
                            });
                        }
                    }
                });

                var geometries = tour.steps.reduce(function (geometries, step) {
                    geometries.push(step.geometry);
                    return geometries;
                }, []);

                traceFeatures = traceFeatures.concat(interestsMarkerBuilderService.build(tour.interests));

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

    }
})();