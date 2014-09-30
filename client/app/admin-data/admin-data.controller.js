'use strict';

angular.module('bikeTouringMapApp')
    .controller('AdminDataCtrl', function ($scope, $upload, BikelaneRepository, GeoConverter) {

        $scope.bikemapFileupload = {
            url: '/api/bikelanes/upload',
            filename: 'Pistes_Cyclables.json',
            callbacks: {
                success: function (data) {
                    $scope.loadBikelanes();
                }
            }
        };

        $scope.init = function () {

            $scope.bikelines = 0;

            $scope.loadBikelanes();

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
                                        "properties": {
                                            "name": "Coors Field",
                                            "amenity": "Baseball Stadium",
                                            "popupContent": "This is where the Rockies play!"
                                        },
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


        return $scope.init();
    });