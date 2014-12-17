(function () {
    'use strict';

    angular.module('globalbikerWebApp').directive('geonamesCityInput', geonamesCityInput);

    function geonamesCityInput($timeout, geonames) {
        return {
            templateUrl: 'components/geonames-city-input/geonames-city-input.html',
            restrict: 'EA',
            scope: {
                city: '=ngModel',
                placeholder: '='
            },
            require: 'ngModel',

            link: {
                pre: function preLink($scope, $element, $attrs, ngModelController) {

                    // scope properties
                    $scope.loading = false;
                    $scope.selectedCity;

                    // default country: France
                    $scope.country = {
                        // geonames
                        "geonameId": 3017382,
                        "countryCode": "FR",
                        "name": "France"
                    };

                    // scope methods
                    $scope.selectCity = selectCity;
                    $scope.formatCityForInput = formatCityForInput;
                    $scope.searchCity = searchCity;

                    // init method
                    init();

                    function init() {

                        // when model change, update our view (just update the div content)
                        ngModelController.$render = function () {
                            $scope.selectedCity = externalToGeonamesModel(ngModelController.$viewValue);
                        };

                    }

                    function selectCity() {
                        // call $parsers pipeline then update $modelValue
                        ngModelController.$setViewValue(geonamesToExternalModel($scope.selectedCity));

                        // update the local view
                        // ngModelController.$render();
                    }

                    function geonamesToExternalModel(geonamesCity) {
                        if (geonamesCity) {

                            if (!geonamesCity.lng || !geonamesCity.lat) {
                                console.error('Invalid lat/lng.');
                                return null;
                            }

                            var city = {
                                geonameId: geonamesCity.geonameId,
                                name: geonamesCity.toponymName,
                                adminName1: geonamesCity.adminName1,
                                geometry: {
                                    coordinates: [parseFloat(geonamesCity.lng), parseFloat(geonamesCity.lat)],
                                    type: 'Point'
                                }
                            };
                            console.log(geonamesCity);

                            console.debug('Select geonames city "%s" (%s).', city.name, city.geometry.coordinates);
                            return city;
                        } else {
                            return null;
                        }
                    }

                    function externalToGeonamesModel(city) {
                        if (city) {
                            if (!city.geometry) {
                                console.error('Invalid city without geometry.');
                                return null;
                            }
                            var geonamesCity = {
                                geonameId: city.geonameId,
                                toponymName: city.name,
                                adminName1: city.adminName1,
                                latitude: city.geometry.coordinates[1],
                                longitude: city.geometry.coordinates[0]
                            };

                            // build label
                            geonamesCity.label = geonames.getFullLabel(geonamesCity);
                            console.debug('Initialize city to "%s".', geonamesCity.label);

                            return geonamesCity;
                        } else {
                            return null;
                        }
                    }

                    function formatCityForInput(city) {
                        return geonames.getShortLabel(city);
                    }

                    function searchCity(startWith) {
                        // search geonames
                        $scope.loading = true;
                        return geonames.searchCitiesByNameAndCountryCode(startWith, $scope.country.countryCode).then(function (cities) {

                            var formatedCities = cities.reduce(function (output, city) {

                                // build label
                                city.label = geonames.getFullLabel(city);

                                output.push(city);
                                return output;
                            }, []);

                            $scope.loading = false;

                            return formatedCities;
                        });
                    };

                }
            }
        };
    };
})();