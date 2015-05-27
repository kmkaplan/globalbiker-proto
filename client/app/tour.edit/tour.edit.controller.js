(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourEditCtrl', TourEditCtrl);

    function TourEditCtrl(tour, $scope, $stateParams, $state, $q, $timeout, Auth, mapStepTraceBuilder, securityService, interestsMarkerBuilderService, PhotoRepository) {

        // scope properties
        $scope.securityService = securityService;
        $scope.mapConfig = {};
        $scope.tinymceOptions = {
            height: '200px',
            menubar: false,
            toolbar: 'bold italic bullist numlist outdent indent removeformat subscript superscript'
        };

        // scope methods
        $scope.saveTour = saveTour;
        $scope.createStep = createStep;
        $scope.selectPhoto = selectPhoto;

        // init method
        init();

        function init() {

            console.log('init');

            if (!tour) {
                $state.go('home');
            } else {
                if (securityService.isTourEditable(tour)) {
                    $scope.tour = tour;

                    showTourOnMap(tour);

                    loadPhotos(tour);

                } else {
                    $state.go('tour.view');
                }
            }
        };

        function loadPhotos(tour) {

            PhotoRepository.searchAroundTour({
                    tourId: tour._id,
                    distance: 10000
                }, function (photos) {
                    $scope.photos = photos;
                },
                function (err) {
                    console.error(err);
                });
        }

        function selectPhoto(photo) {
            $scope.tour.photo = photo;
            $scope.tour.photoId = photo._id;
        }


        function editTour(tour) {
            // update location without reloading
            $state.go('tour.edit', $stateParams, {
                location: true,
                notify: false
            });
        }

        function createStep() {
            $state.go('tour.create-step');
        }

        function showTourOnMap(tour) {
            if (tour.steps) {
                var traceFeatures = mapStepTraceBuilder.buildStepsTracesFeatures(tour.steps, {
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
            var photo = tour.photo;
            var interests = tour.interests;

            delete tour.steps;
            delete tour.photo;
            delete tour.interests;

            tour.$update(function (data, putResponseHeaders) {
                console.info('Tour updated.');

                deffered.resolve(steps);
            }, function (err) {
                deffered.reject(err);
            }).finally(function () {
                tour.steps = steps;
                tour.photo = photo;
                tour.interests = interests;
                $state.go('tour.view', $stateParams);
            });
            return deffered.promise;
        }
    }
})();