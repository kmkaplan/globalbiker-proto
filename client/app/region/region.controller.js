(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('RegionCtrl', RegionCtrl);

    function RegionCtrl($scope, $q, $state, $stateParams, Auth, bikeTourMapService, tourLoaderService, RegionRepository, securityService) {

        // scope properties
        $scope.isAdmin = Auth.isAdmin;
        $scope.mapConfig = {};
        $scope.securityService = securityService;

        // scope methods
        $scope.openTour = openTour;

        // init method
        init();

        function init() {

            $scope.isAdmin = Auth.isAdmin;

            getRegion().then(function (region) {

                $scope.region = region;

                loadToursDetailsByGeometry(region.geometry).then(function (tours) {
                    $scope.tours = tours;

                    var features = buildFeaturesFromTours(tours);

                    if (features) {

                        $scope.mapConfig.items = features;

                        if (region) {

                            $scope.mapConfig.bounds = {
                                geometry: region.geometry
                            };
                        }
                    }
                });

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

        function openTour(tour) {
            $state.go('tour.view', {
                id: tour._id
            }, {
                inherit: false
            });
        }

        function loadToursDetailsByGeometry(geometry) {
            var deffered = $q.defer();

            tourLoaderService.loadToursWithDetails({
                tour: {
                    photo: true
                    /*,
                    photosAround: {
                        distance: 500
                    }*/
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
                        opacity: 1,
                        color: '#34a0b4'
                    },
                    overStyle: {
                        color: '#347eb4',
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