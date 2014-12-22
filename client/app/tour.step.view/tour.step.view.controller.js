(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourStepViewCtrl', TourStepViewCtrl);

    function TourStepViewCtrl(tour, step, $scope, $stateParams, $state, $q, $timeout, Auth, StepRepository, bikeTourMapService, securityService, interestLoaderService, interestsMarkerBuilderService) {

        // scope properties
        $scope.securityService = securityService;
        $scope.mapConfig = {};
        $scope.interest = null

        // scope methods
        $scope.editStep = editStep;
        $scope.openTour = openTour;
        $scope.deleteStep = deleteStep;
        $scope.createStep = createStep;
        $scope.updateInterest = updateInterest;

        // init method
        init();

        function init() {

            if (!tour || !step) {
                $state.go('home');
            } else {
                $scope.tour = tour;
                $scope.step = step;

                showStepOnMap(tour, step);
            }
        };

        function createStep() {
            $state.go('tour.create-step');
        }

        function openTour(tour) {
            $state.go('tour.presentation');
        }

        function editStep(step) {
            $state.go('tour.step.edit', $stateParams);
        }

        function deleteStep(step) {
            if (confirm('Are you sure do you want to delete this step ?')) {

                StepRepository.remove({
                        id: step._id
                    },
                    function () {
                        $state.go('tour.presentation', {}, {
                            'reload': true
                        });
                    });
            }
        }

        function showStepOnMap(tour, step) {
            if (tour && step) {
                var traceFeatures = bikeTourMapService.buildStepTraceFeatures(step, {
                    style: {
                        color: '#34a0b4',
                        width: 3,
                        weight: 6,
                        opacity: 0.8
                    },
                    label: function (step) {
                        return getStepLabel(step);
                    },
                    step: {
                        bounds: {
                            show: true
                        }
                    }
                }, tour);

                if (step.interests) {
                    traceFeatures = traceFeatures.concat(interestsMarkerBuilderService.build(step.interests));
                }

                if (traceFeatures) {
                    $scope.mapConfig.items = traceFeatures;

                    $scope.mapConfig.bounds = {
                        geometry: step.geometry
                    };
                }

                if ($scope.securityService.isTourEditable(tour)) {

                    $scope.mapConfig.drawingTools = [{
                        type: 'marker',
                        created: function (map, config, geometry, e) {
                            $scope.interest = {
                                type: 'interest',
                                geometry: geometry
                            };
                            console.log('Create interest', $scope.interest);
                            $scope.$apply();
                        }
                    }];


                }
            }
        };


        function updateInterest(interest) {
            showStepOnMap($scope.tour, $scope.step);
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