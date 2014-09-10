'use strict';

angular.module('bikeTouringMapApp')
    .controller('AdminDataCtrl', function ($scope, $upload, BikelaneRepository) {

        $scope.onFileSelect = function ($files) {
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


                //  return;

                /*

                var reader = new FileReader();
                reader.onloadend = function () {
                    content = reader.result;

                    var geojsonContent = angular.fromJson(content);

                    var count = 0;

                    var bikelanes = geojsonContent.features.reduce(function (bikelanesOutput, currentFeature) {

                        if (count++ > 1) {
                            return bikelanesOutput;
                        }

                        var points = currentFeature.geometry.coordinates.reduce(function (pointsOutput, c) {

                            var latitude = c[1];
                            var longitude = c[0];

                            pointsOutput.push({
                                latitude: latitude,
                                longitude: longitude
                            });
                            return pointsOutput;

                        }, []);

                        var p = currentFeature.properties;

                        var bikelane = new BikelaneRepository({
                            name: p['Nom_voie'],
                            type: p['obs_type'],
                            surface: p['Revetement'],
                            inseeCode: p['code_insee'],
                            points: points
                        });

                        bikelane.$save();

                        bikelanesOutput.push(bikelane);

                        return bikelanesOutput;

                    }, []);

                    // TODO traitement à faire côté serveur

                    console.log('%d bikelane have been created.', bikelanes.length);

                };

                reader.readAsText(file);
*/

            }
        };


        proj4.defs["EPSG:3943"] = "+proj=lcc +lat_1=42.25 +lat_2=43.75 +lat_0=43 +lon_0=3 +x_0=1700000 +y_0=2200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
        $scope.converter = proj4(proj4.defs["EPSG:3943"]);
        $scope.init = function () {

            $scope.bikelanesUploadProgress = null;

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

                                var polylines = bikelanes.reduce(function (polylines, bikelane) {

                                    /* if (polylines.length > 1000){
                                        return polylines;
                                    }*/


                                    var points = bikelane.points.reduce(function (output, p) {

                                        var transformed = $scope.converter.inverse([p.longitude, p.latitude]);

                                        output.push({
                                            latitude: transformed[1],
                                            longitude: transformed[0]
                                        });
                                        return output;

                                    }, []);

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
            $scope.bikelanesLoading = true;
            BikelaneRepository.query(function (bikelanes) {
                $scope.bikelanes = bikelanes;
                $scope.bikelanesLoading = false;
            }, function () {
                $scope.bikelanesLoading = false;
            });
        };


        return $scope.init();
    });