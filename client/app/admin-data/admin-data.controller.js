'use strict';

angular.module('bikeTouringMapApp')
    .controller('AdminDataCtrl', function ($scope, $upload, InterestRepository, BikelaneRepository, GeoConverter) {

        $scope.bikemapFileupload = {
            url: '/api/bikelanes/upload',
            filename: 'Pistes_Cyclables.json',
            callbacks: {
                success: function (data) {
                    $scope.loadBikelanes();
                }
            }
        };

        $scope.waterpointsUpload = {
            url: '/api/interests/upload',
            filename: 'fontaines_a_boire.json',
            callbacks: {
                success: function (data) {
                    $scope.loadPointsOfInterests();
                }
            }
        };

        $scope.init = function () {

            $scope.bikelines = 0;

            $scope.loadBikelanes();
            $scope.loadPointsOfInterests();

            $scope.mapConfig = {
                class: 'bikelanes-map',
                initialCenter: {
                    lat: 43.61,
                    lng: 1.44,
                    zoom: 12
                },
                callbacks: {
                    'map:created': function (eMap) {
                        $scope.$watch('bikelanes', function (bikelanes, old) {

                            if (bikelanes) {

                                bikelanes.reduce(function (features, bikelane) {

                                    var geojsonFeature = {
                                        "type": "Feature",
                                        "properties": {},
                                        "geometry": bikelane.geometry
                                    };

                                    L.geoJson(geojsonFeature, {
                                        style: function (feature) {
                                            return {
                                                color: '#236d15'
                                            };
                                        }
                                    }).addTo(eMap.map);



                                }, null);
                            }

                        });
                        $scope.$watch('interests', function (interests, old) {

                            if (interests) {

                                interests.reduce(function (features, interest) {
                                    if (interest.geometry) {
                                        var geojsonFeature = {
                                            "type": "Feature",
                                            "properties": {},
                                            "geometry": interest.geometry
                                        };

                                        L.geoJson(geojsonFeature, {
                                            style: function (feature) {
                                                return {
                                                    color: 'red'
                                                };
                                            }
                                        }).addTo(eMap.map);

                                    }

                                }, null);
                            }

                        });

                    }
                }
            };


        };

        $scope.loadBikelanes = function () {
            $scope.loadingInProgress = true;
            BikelaneRepository.query(function (bikelanes) {
                $scope.bikelanes = bikelanes;
                $scope.loadingInProgress = false;
            }, function () {
                $scope.loadingInProgress = false;
            });
        };

        $scope.loadPointsOfInterests = function () {
            $scope.loadingInProgress = true;
            InterestRepository.query(function (interests) {
                $scope.interests = interests;
                $scope.loadingInProgress = false;
            }, function () {
                $scope.loadingInProgress = false;
            });
        };


        return $scope.init();
    });