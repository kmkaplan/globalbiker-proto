'use strict';

angular.module('bikeTouringMapApp')
    .controller('MyTourCtrl', function ($scope, $http, leafletData) {

        $scope.tourCountry = null;

        angular.extend($scope, {
            defaults: {
                // tileLayer: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
                tileLayer: 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg',
                scrollWheelZoom: true,
                maxZoom: 14
            }
        });
        $scope.tourMap = null;

        $scope.drawnItems = [];

        leafletData.getMap('tour-map').then(function (map) {

            $scope.$watch('tourCountry', function (newCountry, oldCountry) {

                if (newCountry !== null && newCountry.countryCode) {

                    return $http.get('http://api.geonames.org/countryInfoJSON?country=' + newCountry.countryCode + '&username=toub', {
                        params: {
                            sensor: false
                        }
                    }).then(function (res) {
                        if (res && res.data && res.data.geonames && res.data.geonames[0]) {

                            var info = res.data.geonames[0];

                            map.fitBounds([
                                [info.north, info.west],
                                [info.south, info.east]
                            ]);
                        }
                    });
                }
            });

            $scope.$watch('steps', function (newSteps, oldSteps) {
                var isFilled = true;
                var previousCityTo = null;
                for (var i = 0; i < newSteps.length; i++) {
                    var step = newSteps[i];
                    if (!step.cityFrom || !step.cityFrom.geonameId || !step.cityTo || !step.cityTo.geonameId || !step.difficulty) {
                        isFilled = false;
                    }
                   
                    if (step.cityFrom && step.cityFrom.geonameId) {

                        if (step.cityTo && step.cityTo.geonameId) {
                            // draw line
                            var polyline = L.polyline([
                                   new L.LatLng(step.cityFrom.lat, step.cityFrom.lng),
                                   new L.LatLng(step.cityTo.lat, step.cityTo.lng)
                                ], {
                                color: 'blue'
                            }).addTo(map);

                            $scope.drawnItems.push(polyline);

                            map.fitBounds(polyline.getBounds());
                        } else {
                            // draw marker for start point
                            var marker = L.marker([step.cityFrom.lat, step.cityFrom.lng]).addTo(map);

                            $scope.drawnItems.push(marker);
                        }
                    }
                    previousCityTo = step.cityTo;
                }
                if (isFilled) {
                    $scope.steps.push({
                        cityFrom: previousCityTo
                    });
                }
            }, true);

        });



        $scope.steps = [{

        }];


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
                    item.label = item.name;
                    cities.push(item);
                });
                return cities;
            });
        };

    });