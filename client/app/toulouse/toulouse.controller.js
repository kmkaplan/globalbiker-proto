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


        $scope.licenses = LicenseRepository.query();

        $scope.getLicense = function (photo) {
            if (!photo || !photo.licenseId) {
                return null;
            }
            var license = $scope.licenses.reduce(function (photoLicense, license) {
                    if (license._id === photo.licenseId) {
                        return license;
                    }
                    return photoLicense;
                },
                null);
            return license;
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

                    $scope.$watch('bikelanes', function (bikelanes, old) {
                        if (bikelanes) {
                            eMap.addItemsToGroup(bikeTourMapService.buildBikelanesFeatures(bikelanes), {
                                name: 'Pistes cyclables',
                                control: true,
                                show: false
                            });
                        }
                    });

                    $scope.$watch('interests', function (interests, old) {
                        if (interests) {
                            eMap.addItemsToGroup(bikeTourMapService.buildInterestsFeatures(interests), {
                                name: 'Principaux points d\'intérêt',
                                control: true
                            });
                        }
                    });

                    $scope.$watch('waterPoints', function (waterPoints, old) {
                        if (waterPoints) {
                            eMap.addItemsToGroup(bikeTourMapService.buildInterestsFeatures(waterPoints), {
                                name: 'Points d\'eau potable',
                                control: true
                            });
                        }
                    });
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
                'interest:clicked': function (interest, eMap, item, itemLayer, e) {
                    if (Auth.isAdmin()) {
                        if (interest.priority === 1) {
                            interest.priority = 0;
                        } else {
                            interest.priority = 1;
                        }
                    }
                },
                'step:clicked': function (step, eMap, item, itemLayer, e) {
                    $state.go('tour-details', {
                        id: step.tourId
                    }, {
                        inherit: false
                    });
                }
            },
            configuration: {
                interests: {
                    visible: {
                        show: true
                    },
                    invisible: {
                        show: false
                    }
                }
            }
        };

        $scope.loadInterestsWithPhotos = function () {

            // retrieve interests
            var deffered = $q.defer();

            InterestRepository.searchAroundPoint({
                    latitude: 43.61,
                    longitude: 1.44,
                    maxDistance: 10000,
                    type: 'interest',
                    withPhoto: true
                }, function (interests) {

                    $scope.interests = interests;
                    deffered.resolve(interests);

                },
                function (err) {
                    deffered.reject(err);
                });

            return deffered.promise;
        };

        $scope.loadToursSteps = function (tours) {
            var defferedArray = tours.reduce(function (defferedArray, tour) {

                var deffered = $q.defer();

                StepRepository.getByTour({
                        tourId: tour._id
                    },
                    function (steps) {
                        tour.steps = steps;

                        deffered.resolve(steps);

                    }, function (err) {
                        deffered.reject(err);
                    });

                defferedArray.push(deffered.promise);
                return defferedArray;

            }, []);

            return $q.all(defferedArray);
        };

        $scope.loadTourDetails = function (tour) {
            var deffered = $q.defer();

            tourLoaderService.loadDetails(tour, {
                tour: {
                    photo: true,
                    photosAround: {
                        distance: 500
                    }
                }

            }).then(function (tour) {
                    deffered.resolve(tour);
                },
                function (err) {
                    console.error(err);
                    deffered.reject(err);
                });

            return deffered.promise;
        };

        $scope.loadTours = function () {

            var deffered = $q.defer();

            TourRepository.query(function (tours) {

                    $scope.loadToursSteps(tours).then(function () {
                        $scope.tours = tours;

                        tours.reduce(function (o, tour) {

                            $scope.loadTourDetails(tour);

                        }, []);

                        /*$scope.loadInterestsWithPhotos().then(function (interestsWithPhotos) {
                                var photos = interestsWithPhotos.reduce(function (photos, interest) {
                                    photos = photos.concat(interest.photos);
                                    return photos;
                                }, []);

                                if (photos.length > 0) {
                                    photos[0].active = true;
                                    $scope.photos = photos.splice(0, 10);
                                }

                                deffered.resolve(tours);
                            },
                            function (err) {
                                deffered.reject(err);
                            });*/
                    });
                },
                function (err) {
                    deffered.reject(err);
                });

            return deffered.promise;
        };

        /* $scope.loadBikelanes = function () {
            $scope.loadingInProgress = true;
            BikelaneRepository.search({
                latitude: 43.61,
                longitude: 1.44,
                maxDistance: 5000
            }, function (bikelanes) {
                $scope.bikelanes = bikelanes;
                $scope.loadingInProgress = false;
            }, function () {
                $scope.loadingInProgress = false;
            });
        };*/
        $scope.init = function () {
            $scope.isAdmin = Auth.isAdmin;
            $scope.loadTours().then(function () {
                //  $scope.loadBikelanes();
            });
        }

        $scope.init();

    });