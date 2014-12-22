(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourStepViewCtrl', TourStepViewCtrl);

    function TourStepViewCtrl(tour, step, $scope, $stateParams, $state, $q, $timeout, Auth, StepRepository, bikeTourMapService) {

        // scope properties
        $scope.mapConfig = {};

        // scope methods
        $scope.isAllowedToEdit = isAllowedToEdit;
        $scope.editStep = editStep;
        $scope.openTour = openTour;
        $scope.deleteStep = deleteStep;
        $scope.createStep = createStep;

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

        function isAllowedToEdit(tour) {
            if (tour && Auth.isLoggedIn() && (Auth.isAdmin() || tour.userId === Auth.getCurrentUser()._id)) {
                return true;
            }
            return false;
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
                }, tour);

                if (traceFeatures) {
                    $scope.mapConfig.items = traceFeatures;

                    $scope.mapConfig.bounds = {
                        geometry: step.geometry
                    };
                }

                $scope.mapConfig.drawingTools = [{
                    type: 'marker',
                    created: function (map, config, point, e) {
                        alert("created");
                    }
                    }];
            }
        };

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