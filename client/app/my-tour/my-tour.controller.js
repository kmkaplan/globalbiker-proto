'use strict';

angular.module('bikeTouringMapApp')
    .controller('MyTourCtrl', function ($scope, $http, $stateParams, $state, $q, leafletData, TourRepository, StepRepository, MyTourViewModelTour, MyTourViewModelStep, MyTourViewModelCity, geonames, MyTourMapService) {

        $scope.init = function () {

            if ($stateParams.id) {

                var deffered = $q.defer();

                // existing tour

                $scope.tourId = $stateParams.id;

                // TODO manage errors

                TourRepository.get({
                    id: $scope.tourId
                }, function (tour) {

                    var tour = new MyTourViewModelTour(tour);

                    // TODO manage errors

                    StepRepository.getByTour({
                        tourId: $scope.tourId
                    }, function (steps) {

                        var lastCityTo = null;

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
                    });

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

        $scope.saveStep = function (step) {

            $scope.createOrUpdateStep(step);

            if ($scope.tour.steps.indexOf(step) === ($scope.tour.steps.length - 1)) {
                $scope.tour.steps.push(new MyTourViewModelStep({
                    cityFrom: step.cityTo
                }));
            }

            $scope.updateMap();
        };

        $scope.editStep = function (step) {
            step.status = 'edit';
            $scope.updateMap();
        };

        $scope.updateMap = function () {
            MyTourMapService.updateMap($scope.mapConfig, $scope.tour);
        };

        $scope.citySelected = function ($item, $model, $label) {
            $scope.updateMap();
        }

        $scope.mapConfig = {
            class: 'my-tour-map',
            callbacks: {
                'map:created': function (map) {

                    $scope.$watch('tour.country', function (newCountry, oldCountry) {

                        if (typeof (newCountry) !== 'undefined' && newCountry !== null && newCountry.countryCode) {

                            return $http.get('http://api.geonames.org/countryInfoJSON?country=' + newCountry.countryCode + '&username=toub', {
                                params: {
                                    sensor: false
                                }
                            }).then(function (res) {
                                if (res && res.data && res.data.geonames && res.data.geonames[0]) {

                                    var info = res.data.geonames[0];
                                    $scope.mapConfig.control.fitBounds([
                                                    [info.north, info.west],
                                                    [info.south, info.east]
                                                ]);
                                }
                            });

                        }
                    });

                }
            }
        };

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
                        name: item.name,
                        adminName1: item.adminName1,
                        latitude: item.lat,
                        longitude: item.lng
                    });

                    output.push(city);
                    return output;
                }, []);
            });
        };

        $scope.updateTitle = function () {
            if ($scope.tourId !== null) {
                // update the title
                // TODO PUT after a delay (only if title is valid)
            }
        };

        $scope.addTour = function () {
            if ($scope.tour.isValid()) {

                // create tour resource
                var newTour = new TourRepository({
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
                    cityFrom: {
                        geonameId: step.cityFrom.geonameId,
                        name: step.cityFrom.name,
                        adminName1: step.cityFrom.adminName1,
                        latitude: step.cityFrom.latitude,
                        longitude: step.cityFrom.longitude
                    },
                    cityTo: {
                        geonameId: step.cityTo.geonameId,
                        name: step.cityTo.name,
                        adminName1: step.cityTo.adminName1,
                        latitude: step.cityTo.latitude,
                        longitude: step.cityTo.longitude
                    }
                });

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
                });
                angular.forEach($scope.tour.steps, function (t, i) {
                    if (t === step) {
                        $scope.tour.steps.splice(i, 1);
                    }
                });
            }
        };

        return $scope.init();
    });