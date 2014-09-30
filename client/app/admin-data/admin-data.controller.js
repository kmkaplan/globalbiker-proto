'use strict';

angular.module('bikeTouringMapApp')
    .controller('AdminDataCtrl', function ($scope, $upload, BikelaneRepository, GeoConverter) {

        $scope.bikemapFileupload = {
            url: '/api/bikelanes/upload',
            filename: 'Pistes_Cyclables.json',
            callbacks: {
                success: function(data) {
                    $scope.loadBikelanes();
                }
            }
        };
    
       /* $scope.onFileSelect = function ($files) {
            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];

                $scope.bikelanesUploadProgress = 0;

                $scope.upload = $upload.upload({
                    url: '/api/bikelanes/upload',
                    file: file,
                }).progress(function (evt) {
                    $scope.bikelanesUploadProgress = (100 * evt.loaded / evt.total);
                }).success(function (data, status, headers, config) {
                    $scope.loadBikelanes();
                    $scope.bikelanesUploadProgress = null;
                }).error(function (msg) {
                    alert(msg);
                    $scope.bikelanesUploadProgress = null;
                });

            }
        };*/

        $scope.init = function () {

          /*  $scope.bikelanesUploadProgress = null;*/

           // $scope.loadBikelanes();
$scope.bikelines = 0;
            
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

                                var polylines = bikelanes.reduce(function (polylines, bikelane) {

                                    var points = GeoConverter.toLatLng(bikelane.points);

                                    var color = 'red';
                                    if (['réseau vert', 'reseau vert', 'couloir bus', 'piste', 'voie verte', 'couloir bus', 'bandes'].indexOf(bikelane.type) !== -1) {
                                        color = 'green';
                                    } else if (['trottoir', 'passage inferieur', 'bande a contresens', 'contre allee', 'escalier', 'passerelle', undefined].indexOf(bikelane.type) !== -1) {
                                        color = 'blue';
                                    } else {
                                        console.warn('Unknown type "%s".', bikelane.type);
                                    }

                                    polylines.push({
                                        type: 'polyline',
                                        color: color,
                                        weight: 3,
                                        opacity: 0.7,
                                        points: points
                                    });

                                    return polylines;
                                }, []);

                                $scope.mapConfig.drawnItems = {
                                    bikelines: {
                                        items: polylines
                                    }
                                };
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
