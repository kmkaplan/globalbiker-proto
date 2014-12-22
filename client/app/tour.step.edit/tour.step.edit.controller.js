(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourStepEditCtrl', TourStepEditCtrl);

    function TourStepEditCtrl(tour, step, $scope, $stateParams, $state, $q, $timeout, Auth, StepRepository, bikeTourMapService) {

        // scope properties
        $scope.mapConfig = {};

        $scope.tinymceOptions = {
            height: '200px',
            menubar: false,
            toolbar: 'bold italic bullist numlist outdent indent removeformat subscript superscript'
        };

        // scope methods
        $scope.saveStep = saveStep;
        $scope.openTour = openTour;

        // init method
        init();

        function init() {

            if (!tour || !step) {
                $state.go('home');
            } else {
                if (isAllowedToEdit(step)) {
                    $scope.tour = tour;
                    $scope.step = step;

                    showStepOnMap(tour, step);
                } else {
                    $state.go('tour.step.view');
                }
            }
        };

        function isAllowedToEdit(tour) {
            if (tour && Auth.isLoggedIn() && (Auth.isAdmin() || tour.userId === Auth.getCurrentUser()._id)) {
                return true;
            }
            return false;
        }

        function openTour(tour) {
            $state.go('tour.presentation');
        }

        function saveStep(step) {
            var deffered = $q.defer();

            step.$update(function (data, putResponseHeaders) {
                console.info('Step updated.');
            }, function (err) {
                deffered.reject(err);
            }).finally(function () {
                $state.go('tour.step.view', $stateParams);
            });
            return deffered.promise;
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