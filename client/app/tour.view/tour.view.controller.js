(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourViewCtrl', TourViewCtrl);

    function TourViewCtrl(tour, $scope, $stateParams, $state, $q, $timeout, Auth, securityService, PhotoRepository, interestsMarkerBuilderService, journeyFeaturesBuilderService, stepFeaturesBuilderService) {

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
            var features = [];
            if (tour.steps) {

                features = stepFeaturesBuilderService.buildAll(tour.steps, {
                    click: function (item, event) {
                        $state.go('tour.step.view', {
                            stepReference: item.model.step.reference
                        });
                    }
                });
            }

            if (features.length === 0) {
                // no step geometry: display tour geometry instead
                if (tour.geometry) {
                    var feature = journeyFeaturesBuilderService.build(tour);
                    features.push(feature);
                }
            }

            if (tour.cityFrom) {
                var feature = interestsMarkerBuilderService.buildDeparture(tour.cityFrom);
                features.push(feature);
            }

            if (tour.cityTo) {
                var feature = interestsMarkerBuilderService.buildArrival(tour.cityTo);
                features.push(feature);
            }

            if (features.length !== 0) {

                var geometries = features.reduce(function (geometries, feature) {
                    geometries.push(feature.geometry);
                    return geometries;
                }, []);

                $scope.mapConfig.items = features;

                $scope.mapConfig.bounds = {
                    geometry: geometries
                };

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