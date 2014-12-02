'use strict';

angular.module('globalbikerWebApp')
    .controller('ToulouseCtrl', function ($scope, $q, $state, Auth, TourRepository, StepRepository, InterestRepository, BikelaneRepository, bikeTourMapService, LicenseRepository, tourLoaderService) {

        $scope.isAdmin = Auth.isAdmin;

        $scope.isAllowedToEdit = function (tour) {
            if (tour && Auth.isLoggedIn() && (Auth.isAdmin() || tour.userId === Auth.getCurrentUser()._id)) {
                return true;
            }
            return false;
        }

        $scope.mapConfig = {
            class: 'toulouse-map',
            initialCenter: {
                lat: 43.6,
                lng: 1.45,
                zoom: 11
            },
            callbacks: {
                'map:created': function (eMap) {

                    $scope.openStep = function (step) {
                        $state.go('step-details', {
                            id: step._id
                        }, {
                            inherit: false
                        });
                    }
                    $scope.openTour = function (tour) {
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

                    $scope.$watch('tours', function (tours, old) {
                        if (tours) {

                            var toursToDisplayInMap = tours.reduce(function (toursToDisplayInMap, tour) {
                                if (tour.priority === 1) {
                                    toursToDisplayInMap.push(tour);
                                }
                                return toursToDisplayInMap;
                            }, []);

                            var traceFeatures = bikeTourMapService.buildToursStepTracesFeatures(toursToDisplayInMap, {
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

                            eMap.addItemsToGroup(traceFeatures, {
                                name: 'Tracés des itinéraires',
                                control: true
                            });

                        }
                    });

                },
                'step:clicked': function (step, eMap, item, itemLayer, e) {
                    $state.go('tour-details', {
                        id: step.tourId
                    }, {
                        inherit: false
                    });
                }
            },
        };
    
        $scope.loadTourdDetails = function () {
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


        $scope.init = function () {
            $scope.isAdmin = Auth.isAdmin;

            $scope.loadTourdDetails().then(function (tours) {
                $scope.tours = tours;
            });
        }

        $scope.init();

    });