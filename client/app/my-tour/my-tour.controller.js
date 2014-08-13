'use strict';

angular.module('bikeTouringMapApp').factory('MyTour', function () {
    return function (data) {
        //set defaults properties and functions
        angular.extend(this, {
            title: null,
            country: null,
            isValid: function () {
                return this.title && this.country && this.country.geonameId;
            },
            isReadyToCreate: function () {
                return !this.isPersisted() && this.isValid();
            },
            isPersisted: function () {
                return typeof (this._id) !== 'undefined';
            }
        });
        angular.extend(this, data);
    };
});


angular.module('bikeTouringMapApp').factory('MyTourStep', function () {
    return function (data) {
        //set defaults properties and functions
        angular.extend(this, {
            status: 'edit',
            isValid: function () {
                return this.cityFrom && this.cityFrom.geonameId && this.cityTo && this.cityTo.geonameId && this.difficulty;
            },
            isReadyToSave: function () {
                return this.status === 'edit' && this.isValid();
            },
            isEditable: function () {
                return this.status === 'read-only';
            },
            cityFrom: null,
            cityTo: null

        });
        angular.extend(this, data);
    };
});

angular.module('bikeTouringMapApp')
    .controller('MyTourCtrl', function ($scope, $http, $stateParams, $state, leafletData, Tour, MyTour, MyTourStep, geonames) {

        $scope.init = function () {

            if ($stateParams.id) {
                // existing tour

                $scope.tourId = $stateParams.id;

                return Tour.get({
                    id: $stateParams.id
                }, function (tour) {
                    $scope.tour = new MyTour(tour);

                    if (typeof ($scope.tour.steps) === 'undefined') {
                        $scope.tour.steps = [new MyTourStep()];
                    }

                    if ($scope.tour.steps.length === 0) {
                        $scope.tour.steps.push(new MyTourStep());
                    }
                });


            } else {

                $scope.tourId = null;

                // new tour
                // init tour with default country
                $scope.tour = new MyTour({
                    // default country: France
                    country: {
                        // geonames
                        "geonameId": 3017382,
                        "countryCode": "FR",
                        "name": "France"
                    },
                    steps: [new MyTourStep()]
                });
            }

            $scope.updateMap();
        };

        $scope.saveStep = function (step) {
            step.status = 'read-only';
            if ($scope.tour.steps.indexOf(step) === ($scope.tour.steps.length - 1)) {
                $scope.tour.steps.push(new MyTourStep({
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

            var markers = $scope.tour.steps.reduce(function (output, item) {

                if (!item.isValid()) {
                    // only display city markers
                    if (item.cityFrom && item.cityFrom.geonameId) {
                        output.push({
                            type: 'marker',
                            latitude: item.cityFrom.lat,
                            longitude: item.cityFrom.lng
                        });
                    }
                    if (item.cityTo && item.cityTo.geonameId) {
                        output.push({
                            type: 'marker',
                            latitude: item.cityTo.lat,
                            longitude: item.cityTo.lng
                        });
                    }
                }
                return output;
            }, []);

            var polylines = $scope.tour.steps.reduce(function (output, item) {

                if (item.isValid()) {
                    // display route line
                    output.push({
                        type: 'polyline',
                        points: [{
                            latitude: item.cityFrom.lat,
                            longitude: item.cityFrom.lng
                        }, {
                            latitude: item.cityTo.lat,
                            longitude: item.cityTo.lng
                        }]
                    });
                }
                return output;
            }, []);

            $scope.mapConfig.drawnItems = {
                routesCities: {
                    items: markers
                },
                routesPaths: {
                    items: polylines
                }
            };

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
                    item.label = geonames.cityToNameAndAdminName1(item);
                    output.push(item);
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
                $http.post('/api/tours', {
                    title: $scope.tour.title,
                    country: {
                        geonameId: $scope.tour.country.geonameId,
                        name: $scope.tour.country.name,
                        countryCode: $scope.tour.country.countryCode
                    }
                }).then(function (res) {
                    $state.go('my-tour', {
                        id: res.data._id
                    }, {
                        inherit: false
                    });
                });
            }
        };

        $scope.addStep = function () {
            if ($scope.tour.isValid()) {
                $http.post('/api/tours', {
                    title: $scope.tour.title,
                    country: {
                        geonameId: $scope.tour.country.geonameId,
                        name: $scope.tour.country.name,
                        countryCode: $scope.tour.country.countryCode
                    }
                }).then(function (res) {
                    $state.go('my-tour', {
                        id: res.data._id
                    }, {
                        inherit: false
                    });
                });
            }
        };

        $scope.cityToName = function (city) {
            return geonames.cityToName(city);
        };

        $scope.countryToName = function (country) {
            return geonames.countryToName(country);
        };

        return $scope.init();
    });