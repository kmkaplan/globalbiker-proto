(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('RegionCtrl', RegionCtrl);

    function RegionCtrl($scope, $q, $state, $stateParams, Auth, bikeTourMapService, tourLoaderService, RegionRepository) {

        // scope properties
        $scope.isAdmin = Auth.isAdmin;
        $scope.mapConfig;

        // scope methods
        $scope.openStep = openStep;
        $scope.openTour = openTour;
        $scope.isAllowedToEdit = isAllowedToEdit;


        // init method
        init();

        function init() {

            $scope.isAdmin = Auth.isAdmin;

            getRegion().then(function (region) {

                $scope.region = region;

                loadToursDetailsByGeometry(region.geometry).then(function (tours) {
                    $scope.tours = tours;
                });

                $scope.mapConfig = initMapConfig();
            });

        }

        function getRegion() {

            var deffered = $q.defer();

            RegionRepository.findByReference({
                reference: $stateParams.reference
            }, function (region) {

                deffered.resolve(region);

            }, function (err) {
                // error loading tour
                deffered.reject(err);
            });

            return deffered.promise;

        }

        function isAllowedToEdit(tour) {
            if (tour && Auth.isLoggedIn() && (Auth.isAdmin() || tour.userId === Auth.getCurrentUser()._id)) {
                return true;
            }
            return false;
        }

        function openStep(step) {
            $state.go('step-details', {
                id: step._id
            }, {
                inherit: false
            });
        }

        function openTour(tour) {
            if (tour.steps && tour.steps.length === 1) {
                $scope.openStep(tour.steps[0]);
            } else {
                $state.go('tour-details', {
                    id: tour._id
                }, {
                    inherit: false
                });
            }
        }

        function loadToursDetailsByGeometry(geometry) {
            var deffered = $q.defer();

            tourLoaderService.loadToursWithDetails({
                tour: {
                    photo: true,
                    photosAround: {
                        distance: 500
                    }
                },
                steps: {}

            }).then(function (tours) {
                    deffered.resolve(tours);
                },
                function (err) {
                    console.error(err);
                    deffered.reject(err);
                });

            return deffered.promise;
        };

        function initMapConfig() {
            var mapConfig = {
                class: 'region-map',
               /* initialCenter: {
                    lat: 43.6,
                    lng: 1.45,
                    zoom: 11
                },*/
                callbacks: {
                    'map:created': function (eMap) {

                        $scope.$watch('tours', function (tours, old) {

                            var features = buildFeaturesFromTours(tours);

                            if (features) {
                                eMap.addItemsToGroup(features, {
                                    name: 'Tracés des itinéraires',
                                    control: true
                                });
                                if ($scope.region) {
                                    eMap.config.control.fitBoundsFromGeometry($scope.region.geometry, 0);
                                }
                            }
                        });

                    },
                    'step:clicked': function (step, eMap, item, itemLayer, e) {
                        openStep(step);
                    }
                },
            };
            return mapConfig;
        }

        function buildFeaturesFromTours(tours) {
            var features = null;

            if (tours) {

                var toursToDisplayInMap = tours.reduce(function (toursToDisplayInMap, tour) {
                    if (tour.priority === 1) {
                        toursToDisplayInMap.push(tour);
                    }
                    return toursToDisplayInMap;
                }, []);

                features = bikeTourMapService.buildToursStepTracesFeatures(toursToDisplayInMap, {
                    style: {
                        width: 3,
                        weight: 6,
                        opacity: 0.8
                    },
                    overStyle: {
                        color: '#34a0b4',
                        opacity: 1
                    },
                    callbacks: {
                        'click': function (step, tour) {
                            $scope.openTour(tour);
                        }
                    },
                    label: function (step, tour) {
                        return tour.title;
                    }
                });



            }
            return features;

        }

    }
})();