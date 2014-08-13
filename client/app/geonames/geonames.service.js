'use strict';

angular.module('bikeTouringMapApp')
    .service('geonames', function ($http, $q) {
        // AngularJS will instantiate a singleton by calling "new" on this function
        return {

            // TODO extract as app parameter
            _username: 'toub',

            searchCountriesByName: function (startsWith) {



                return $q(function (resolve, reject) {

                    // build URL
                    var url = 'http://api.geonames.org/searchJSON?featureCode=PCLI&maxRows=10';
                    url += '&name_startsWith=' + startsWith;
                    url += '&username=' + this._username;

                    // request geonames
                    return $http.get(url, {
                        params: {
                            sensor: false
                        }
                    }).then(function (res) {
                        // success: return geonames results
                        resolve(res.data.geonames);

                    }, function (reason) {
                        // failure
                        reject(reason);
                    });
                });
            },

            searchCitiesByNameAndCountryCode: function (startsWith, countryCode) {

                var deffered = $q.defer();

                // build URL
                var url = 'http://api.geonames.org/searchJSON?cities=cities1000&maxRows=10';
                url += '&name_startsWith=' + startsWith;
                url += '&country=' + countryCode;
                url += '&username=' + this._username;

                // request geonames
                $http.get(url, {
                    params: {
                        sensor: false
                    }
                }).then(function (res) {
                    // success: return geonames results
                    deffered.resolve(res.data.geonames);

                }, function (reason) {
                    // failure
                    deffered.reject(reason);
                });

                return deffered.promise;

            },

            searchByGeonameId: function (geonameId) {

                return $q(function (resolve, reject) {

                    // build URL
                    var url = 'http://api.geonames.org/getJSON?geonameId=' + geonameId;
                    url += '&username=' + this._username;

                    // request geonames
                    return $http.get(url, {
                        params: {
                            sensor: false
                        }
                    }).then(function (value) {
                        // success: return geonames results
                        resolve(res.data.geonames);

                    }, function (reason) {
                        // failure
                        reject(reason);
                    });
                });

            },

            cityToName: function (city) {
                if (city && city.name) {
                    return city.name;
                } else {
                    return '';
                }
            },

            cityToNameAndAdminName1: function (city) {
                if (city && city.name) {
                    var s = city.name;
                    if (city.adminName1) {
                        s += ' (' + city.adminName1 + ')';
                    }
                    return s;
                } else {
                    return '';
                }
            },

            countryToName: function (country) {
                if (country && country.name) {
                    return country.name;
                } else {
                    return '';
                }
            },

            countryToNameAndAdminName1: function (city) {
                if (city && city.countryName) {
                    var s = city.countryName;
                    if (city.countryCode) {
                        s += ' (' + city.countryCode + ')';
                    }

                    return s;
                } else {
                    return '';
                }
            }
        };
    });