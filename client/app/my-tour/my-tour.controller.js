'use strict';

angular.module('bikeTouringMapApp').factory('MyTourStep', function () {
    var MyTourStep = function (data) {
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
    return MyTourStep;
});

angular.module('bikeTouringMapApp')
    .controller('MyTourCtrl', function ($scope, $http, leafletData, MyTourStep) {

        $scope.init = function () {

            $scope.tourCountry = {
                // custom
                "label": "France (FR)",
                // geonames
                "adminCode1": "00",
                "lng": "2",
                "geonameId": 3017382,
                "toponymName": "Republic of France",
                "countryId": "3017382",
                "fcl": "A",
                "population": 64768389,
                "countryCode": "FR",
                "name": "France",
                "fclName": "country, state, region,...",
                "countryName": "France",
                "fcodeName": "independent political entity",
                "adminName1": "",
                "lat": "46",
                "fcode": "PCLI"
            };

            $scope.steps = [
            new MyTourStep({
                    cityFrom: {
                        // custom
                        "label": "Toulouse (Midi-Pyrénées)",
                        // geonames
                        "adminCode1": "B3",
                        "lng": "1.44367",
                        "geonameId": 2972315,
                        "toponymName": "Toulouse",
                        "countryId": "3017382",
                        "fcl": "P",
                        "population": 433055,
                        "countryCode": "FR",
                        "name": "Toulouse",
                        "fclName": "city, village,...",
                        "countryName": "France",
                        "fcodeName": "seat of a first-order administrative division",
                        "adminName1": "Midi-Pyrénées",
                        "lat": "43.60426",
                        "fcode": "PPLA"
                    },
                    cityTo: {
                        // custom
                        "label": "Narbonne (Languedoc-Roussillon)",
                        // geonames
                        "countryId": "3017382",
                        "adminCode1": "A9",
                        "countryName": "France",
                        "fclName": "city, village,...",
                        "countryCode": "FR",
                        "lng": "3",
                        "fcodeName": "seat of a third-order administrative division",
                        "toponymName": "Narbonne",
                        "fcl": "P",
                        "name": "Narbonne",
                        "fcode": "PPLA3",
                        "geonameId": 2990919,
                        "lat": "43.18333",
                        "adminName1": "Languedoc-Roussillon",
                        "population": 50776
                    }
                })
        ];

            $scope.updateMap();
        };

        $scope.saveStep = function (step) {
            step.status = 'read-only';
            if (this.steps.indexOf(step) === (this.steps.length - 1)) {
                $scope.steps.push(new MyTourStep({
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

            var markers = $scope.steps.reduce(function (output, item) {

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

            var polylines = $scope.steps.reduce(function (output, item) {

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

        $scope.mapConfig = {
            class: 'my-tour-map',
            callbacks: {
                'map:created': function (map) {

                    $scope.$watch('tourCountry', function (newCountry, oldCountry) {

                        if (newCountry !== null && newCountry.countryCode) {

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
            return $http.get('http://api.geonames.org/searchJSON?name_startsWith=' + val + '&featureCode=PCLI&maxRows=10&username=toub', {
                params: {
                    sensor: false
                }
            }).then(function (res) {
                var countries = [];
                angular.forEach(res.data.geonames, function (item) {
                    item.label = item.countryName + ' (' + item.countryCode + ')';
                    countries.push(item);
                });
                return countries;
            });
        };

        $scope.getCity = function (val) {
            return $http.get('http://api.geonames.org/searchJSON?name_startsWith=' + val + '&cities=cities1000&country=' + $scope.tourCountry.countryCode + '&maxRows=10&username=toub', {
                params: {
                    sensor: false
                }
            }).then(function (res) {
                var cities = [];
                angular.forEach(res.data.geonames, function (item) {
                    item.label = $scope.cityToNameAndAdminName1(item);
                    cities.push(item);
                });
                return cities;
            });
        };

        $scope.cityToName = function (city) {
            if (city && city.name) {
                return city.name;
            } else {
                return '';
            }
        };
        $scope.cityToNameAndAdminName1 = function (city) {
            if (city && city.name) {
                var s = city.name;
                if (city.adminName1) {
                    s += ' (' + city.adminName1 + ')';
                }
                return s;
            } else {
                return '';
            }
        };

        $scope.addTour = function () {
            $http.post('/api/tour', {
                name: $scope.newThing
            });
        };

        $scope.init();



    });