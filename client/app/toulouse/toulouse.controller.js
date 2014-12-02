(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('ToulouseCtrl', ToulouseCtrl);

    function ToulouseCtrl($scope, $q, $state, Auth, bikeTourMapService, tourLoaderService) {

        /* jshint validthis: true */
        var vm = this;

        $scope.isAdmin = Auth.isAdmin;

        $scope.openStep = openStep;
        $scope.openTour = openTour;

        $scope.isAllowedToEdit = function (tour) {
            if (tour && Auth.isLoggedIn() && (Auth.isAdmin() || tour.userId === Auth.getCurrentUser()._id)) {
                return true;
            }
            return false;
        }

        $scope.mapConfig;

        init();

        function init() {

            $scope.isAdmin = Auth.isAdmin;

            loadTourdDetails().then(function (tours) {
                $scope.tours = tours;
            });

            $scope.mapConfig = initMapConfig();

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

        function loadTourdDetails() {
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
            return {
                class: 'toulouse-map',
                initialCenter: {
                    lat: 43.6,
                    lng: 1.45,
                    zoom: 11
                },
                callbacks: {
                    'map:created': function (eMap) {

                        $scope.$watch('tours', function (tours, old) {

                            var features = buildFeaturesFromTours(tours);

                            if (features) {
                                eMap.addItemsToGroup(features, {
                                    name: 'Tracés des itinéraires',
                                    control: true
                                });
                            }
                        });

                    },
                    'step:clicked': function (step, eMap, item, itemLayer, e) {
                        openStep(step);
                    }
                },
            };
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