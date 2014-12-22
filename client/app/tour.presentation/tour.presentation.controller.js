(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourPresentationCtrl', TourPresentationCtrl);

    function TourPresentationCtrl(tour, $scope, $stateParams, $state, $q, $timeout, Auth, bikeTourMapService) {

        // scope properties
        $scope.mapConfig = {};
        $scope.inEdition = isAllowedToEdit(tour) && $state.current.data.edit | false;
        $scope.tinymceOptions = {
            height: '200px',
            menubar: false,
            toolbar: 'bold italic bullist numlist outdent indent removeformat subscript superscript'
        };

        // scope methods
        $scope.isAllowedToEdit = isAllowedToEdit;
        $scope.saveTour = saveTour;
        $scope.editTour = editTour;
        $scope.createStep = createStep;

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
            $scope.inEdition = true;
            // update location without reloading
            $state.go('tour.edition', $stateParams, {
                location: true,
                notify: false
            });
        }

        function createStep() {
            $state.go('tour.create-step');
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

        function saveTour(tour) {
            var deffered = $q.defer();

            var steps = tour.steps;

            tour.$update(function (data, putResponseHeaders) {
                console.info('Tour updated.');
                tour.steps = steps;
                deffered.resolve(steps);
            }, function (err) {
                deffered.reject(err);
            }).finally(function () {

                $scope.inEdition = false;
                $state.go('tour.presentation', $stateParams);
            });
            return deffered.promise;
        }

        function isAllowedToEdit(tour) {
            if (tour && Auth.isLoggedIn() && (Auth.isAdmin() || tour.userId === Auth.getCurrentUser()._id)) {
                return true;
            }
            return false;
        }
    }
})();