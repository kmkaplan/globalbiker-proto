(function () {
    'use strict';

    angular.module('globalbikerWebApp').directive('truncateText', truncateText);

    function truncateText() {
        return {
            restrict: 'A',
            link: function (scope, element, attributes) {
                scope.$watch(function () {
                    element.dotdotdot({
                        watch: true
                    });
                });
            }
        }
    };

    angular.module('globalbikerWebApp').controller('RegionCtrl', RegionCtrl);

    function RegionCtrl($scope, $q, $state, $stateParams,$timeout,  Auth, tourFeaturesBuilderService, tourLoaderService, RegionRepository, securityService) {

        // scope properties
        $scope.isAdmin = Auth.isAdmin;
        $scope.mapConfig = {};
        $scope.securityService = securityService;

        // scope methods
        $scope.openTour = openTour;
        $scope.overTour = overTour;
        $scope.showTourDetails = showTourDetails;
        $scope.isCollapsed = isCollapsed;

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



        function showTourDetails(tour) {
            $scope.showTourDetailsId = tour._id;
        }

        function isCollapsed(tour) {
            return ($scope.showTourDetailsId !== tour._id);
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
                reference: tour.reference
            }, {
                inherit: false
            });
        }

        function overTour(tour) {

            var tourId = (tour && tour._id) ? tour._id : null;
            var currentTourId = ($scope.currentTour && $scope.currentTour._id) ? $scope.currentTour._id : null;

            if (tourId !== currentTourId) {
                console.log('Tour selection updated from %s to %s.', currentTourId, tourId);
                drawAfterDelay(tour);
            }
        }

        function drawAfterDelay(tour) {
            if ($scope.drawTimeout) {
                $timeout.cancel($scope.drawTimeout);
                $scope.drawTimeout = null;
            }

            $scope.drawTimeout = $timeout(function () {
                $scope.currentTour = tour;

                var features = buildFeaturesFromTours($scope.tours);

                if (features) {
                    $scope.mapConfig.items = features;
                }
            }, 50);

        }

        function loadToursDetailsByGeometry(geometry) {
            var deffered = $q.defer();

            tourLoaderService.loadToursWithDetails({
                tour: {
                    photo: true
                }

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

                        tour.selected = ($scope.currentTour && $scope.currentTour._id === tour._id)

                        toursToDisplayInMap.push(tour);
                    }
                    return toursToDisplayInMap;
                }, []);

                features = tourFeaturesBuilderService.buildAll(tours, {
                    click: function (item, event) {
                        $scope.openTour(item.model.tour);
                    }
                });

            }
            return features;

        }

    }
})();