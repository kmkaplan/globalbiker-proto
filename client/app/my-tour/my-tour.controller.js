'use strict';

angular.module('globalbikerWebApp')
    .controller('MyTourCtrl', function ($scope, $http, $stateParams, $state, $q, $timeout, leafletData, TourRepository, StepRepository, MyTourViewModelTour, MyTourViewModelStep, MyTourViewModelCity, geonames, MyTourMapService, Auth, bikeTourMapService, PhotoRepository, tourLoaderService) {

        $scope.photo = {};

        $scope.loadPhotosAroundTour = function (tourId) {

            // retrieve interests
            var deffered = $q.defer();

            PhotoRepository.searchAroundTour({
                    tourId: tourId,
                    distance: 1000
                }, function (photos) {
                    $scope.photos = photos
                    deffered.resolve(photos);
                },
                function (err) {
                    deffered.reject(err);
                });

            return deffered.promise;
        };

        $scope.retrievePhotoById = function (photoId) {

            var deffered = $q.defer();

            PhotoRepository.get({
                id: photoId
            }, function (photo) {
                deffered.resolve(photo);
            }, function (err) {
                console.error(err);
                deffered.reject(err);
            });

            return deffered.promise;
        };

        $scope.loadTourWithSteps = function () {
            var deffered = $q.defer();

            $scope.loadTour().then(function (tour) {

                StepRepository.getByTour({
                    tourId: $scope.tourId
                }, function (steps) {

                    var lastCityTo = null;

                    $scope.steps = steps;

                    // convert steps to viewmodel
                    var steps = steps.reduce(function (output, step) {
                        output.push(new MyTourViewModelStep(step));
                        lastCityTo = step.cityTo;
                        return output;
                    }, []);

                    tour.steps = steps;

                    // add a new tour
                    tour.steps.push(new MyTourViewModelStep({
                        cityFrom: lastCityTo
                    }));

                    $scope.tour = tour;

                    $scope.updateMap();

                    deffered.resolve(tour);
                }, function (err) {
                    console.error(err);
                    deffered.reject(err);
                });

            });

            return deffered.promise;

        }

        $scope.loadTour = function () {
            var deffered = $q.defer();

            tourLoaderService.loadTour($scope.tourId, {
                tour: {
                    photo: true,
                    photosAround: {
                        distance: 500
                    }
                }

            }).then(function (tour) {
                    var tour = new MyTourViewModelTour(tour);
                    deffered.resolve(tour);
                },
                function (err) {
                    console.error(err);
                    deffered.reject(err);
                });

            return deffered.promise;
        };

        $scope.getStepLabel = function (step) {
            if (step.cityFrom.name === step.cityTo.name) {
                // same source & destination
                return step.cityFrom.name;
            } else {
                return 'From ' + step.cityFrom.name + ' to ' + step.cityTo.name;
            }
        };

        $scope.init = function () {

            if ($stateParams.id) {

                var deffered = $q.defer();

                // existing tour

                $scope.tourId = $stateParams.id;

                $scope.loadTourWithSteps().then(function () {

                    $scope.mapConfig = {
                        class: 'my-tour-map',
                        callbacks: {
                            'map:created': function (eMap) {

                                $scope.eMap = eMap;


                                $scope.$watch('tour.country', function (newCountry, oldCountry) {

                                    if (typeof (newCountry) !== 'undefined' && newCountry !== null && newCountry.countryCode) {

                                        return $http.get('http://api.geonames.org/countryInfoJSON?country=' + newCountry.countryCode + '&username=toub', {
                                            params: {
                                                sensor: false
                                            }
                                        }).then(function (res) {
                                            if (res && res.data && res.data.geonames && res.data.geonames[0]) {

                                                var info = res.data.geonames[0];
                                                $scope.countryBounds = [
                                                    [info.north, info.west],
                                                    [info.south, info.east]
                                                ];
                                            }
                                            if (!$scope.steps || $scope.steps.length === 0) {
                                                $scope.autozoom();
                                            }

                                            $scope.$watchCollection('steps', function (steps, old) {

                                                if (steps) {
                                                    var traceFeatures = bikeTourMapService.buildStepsTracesFeatures(steps, {
                                                        style: {
                                                            color: '#34a0b4',
                                                            width: 3,
                                                            weight: 6,
                                                            opacity: 0.8
                                                        },
                                                        label: function (step) {
                                                            return $scope.getStepLabel(step);
                                                        },
                                                        callbacks: {
                                                            'click': function (step) {
                                                                $state.go('my-tour-step', {
                                                                    id: step._id
                                                                }, {
                                                                    inherit: false
                                                                });
                                                            }
                                                        }
                                                    });

                                                    eMap.addItemsToGroup(traceFeatures, {
                                                        name: 'Tracés des itinéraires',
                                                        control: true
                                                    });
                                                    var geometries = steps.reduce(function (geometries, step) {
                                                        geometries.push(step.geometry);
                                                        return geometries;
                                                    }, []);
                                                    $timeout(function () {
                                                        eMap.config.control.fitBoundsFromGeometries(geometries);
                                                    }, 200);
                                                }
                                            });

                                        });

                                    }

                                });

                            }
                        }
                    };

                });

                return deffered.promise;

            } else {

                $scope.tourId = null;

                // new tour
                // init tour with default country
                $scope.tour = new MyTourViewModelTour({
                    // default country: France
                    country: {
                        // geonames
                        "geonameId": 3017382,
                        "countryCode": "FR",
                        "name": "France"
                    },
                    steps: [new MyTourViewModelStep()]
                });
            }

        };

        $scope.autozoom = function () {
            var points = $scope.tour.steps.reduce(function (points, step) {
                if (step.cityFrom) {
                    points.push(step.cityFrom);
                }
                if (step.cityTo) {
                    points.push(step.cityTo);
                }
                return points;
            }, []);
            if (points.length > 1) {
                if ($scope.eMap) {
                    $scope.eMap.config.control.fitBoundsFromPoints(points, 0.2);
                }
            } else {
                if ($scope.countryBounds && $scope.countryBounds.length > 1) {
                    $scope.eMap.config.control.fitBounds($scope.countryBounds);
                }
            }
        };

        $scope.saveStep = function (step) {

            $scope.createOrUpdateStep(step);

            if ($scope.tour.steps.indexOf(step) === ($scope.tour.steps.length - 1)) {
                $scope.tour.steps.push(new MyTourViewModelStep({
                    cityFrom: step.cityTo
                }));
            }

            $scope.updateMap();
            $scope.autozoom();
        };

        $scope.editStep = function (step) {
            step.status = 'edit';
            $scope.updateMap();
        };

        $scope.updateMap = function () {
            // MyTourMapService.updateMap($scope.mapConfig, $scope.tour);
        };

        $scope.citySelected = function ($item, $model, $label) {
            $scope.updateMap();
        }

        $scope.getCountry = function (val) {

            // search geonames
            return geonames.searchCountriesByName(startWith).then(function (countries) {

                // build label
                return countries.reduce(function (output, item) {
                    item.label = geonames.countryToNameAndAdminName1(item);
                    output.push(item);
                    return output;
                }, []);

            });
        };

        $scope.getCity = function (startWith) {
            // search geonames
            return geonames.searchCitiesByNameAndCountryCode(startWith, $scope.tour.country.countryCode).then(function (cities) {

                // build label
                return cities.reduce(function (output, item) {
                    var city = new MyTourViewModelCity({
                        geonameId: item.geonameId,
                        name: item.toponymName,
                        adminName1: item.adminName1,
                        latitude: item.lat,
                        longitude: item.lng
                    });

                    output.push(city);
                    return output;
                }, []);
            });
        };

        $scope.submitCreateTour = function (form) {
            if (form.$valid) {

                var user = Auth.getCurrentUser();

                // create tour resource
                var newTour = new TourRepository({
                    userId: user._id,
                    title: $scope.tour.title,
                    country: {
                        geonameId: $scope.tour.country.geonameId,
                        name: $scope.tour.country.name,
                        countryCode: $scope.tour.country.countryCode
                    }
                });

                // save resource
                newTour.$save(function (data, putResponseHeaders) {
                    // success: redirect to edit page
                    $state.go('my-tour', {
                        id: data._id
                    }, {
                        inherit: false
                    });
                });
            }
        };

        $scope.editProperties = function () {
            $scope.isEditProperties = true;
        };

        $scope.saveProperties = function () {
            if ($scope.tour && $scope.tour.originalModel) {
                $scope.isEditProperties = false;
                // save after a short delay
                if ($scope.tour.photo) {
                    $scope.tour.originalModel.photoId = $scope.tour.photo._id;
                } else {
                    delete $scope.tour.originalModel.photoId;
                }
                $scope.tour.originalModel.$update(function (data, putResponseHeaders) {
                    console.info('Tour updated.');

                }, function (err) {
                    // TODO manage errors
                    $scope.isEditProperties = true;
                });

            }
        };

        $scope.editStepDetails = function (step) {
            // redirect to edit step page
            $state.go('my-tour-step', {
                id: step._id
            }, {
                inherit: false
            });
        };

        $scope.createOrUpdateStep = function (step) {
            if (step.isValid()) {

                // TODO display 'save in progress' indicator

                // create step resource
                var stepResource = new StepRepository({
                    _id: step._id,
                    tourId: $scope.tour._id,
                    difficulty: step.difficulty,
                    interest: step.interest,
                    cityFrom: {
                        geonameId: step.cityFrom.geonameId,
                        name: step.cityFrom.name,
                        adminName1: step.cityFrom.adminName1,
                        latitude: parseFloat(step.cityFrom.latitude),
                        longitude: parseFloat(step.cityFrom.longitude),
                        geometry: step.cityFrom.geometry
                    },
                    cityTo: {
                        geonameId: step.cityTo.geonameId,
                        name: step.cityTo.name,
                        adminName1: step.cityTo.adminName1,
                        latitude: parseFloat(step.cityTo.latitude),
                        longitude: parseFloat(step.cityTo.longitude),
                        geometry: step.cityTo.geometry
                    }
                });
                if (!stepResource.cityFrom.geometry) {
                    stepResource.cityFrom.geometry = {
                        type: 'Point',
                        coordinates: [ parseFloat(step.cityFrom.longitude),  parseFloat(step.cityFrom.latitude)]
                    };
                }
                if (!stepResource.cityTo.geometry) {
                    stepResource.cityTo.geometry = {
                        type: 'Point',
                        coordinates: [ parseFloat(step.cityTo.longitude),  parseFloat(step.cityTo.latitude)]
                    };
                }


                if (!step.isPersisted()) {

                    // create resource
                    stepResource.$save(function (data, putResponseHeaders) {
                        // success
                        // TODO display indicator of success
                        step._id = data._id;
                        step.status = 'read-only';
                    });
                } else {
                    // update resource
                    stepResource.$update(function (data, putResponseHeaders) {
                        // success
                        // TODO display indicator of success
                        step.status = 'read-only';
                    });
                }
            }
        };
        $scope.cityToName = function (city) {
            return geonames.cityToName(city);
        };

        $scope.countryToName = function (country) {
            return geonames.countryToName(country);
        };

        $scope.deleteStep = function (step) {

            if (confirm('Are you sure do you want to delete this step ?')) {

                StepRepository.remove({
                        id: step._id
                    },
                    function () {
                        $scope.loadTourWithSteps().then(function () {
                            $scope.autozoom();
                        });
                    });
            }
        };

        return $scope.init();
    });