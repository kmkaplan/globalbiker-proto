'use strict';

angular.module('bikeTouringMapApp')
    .controller('AdminDataCtrl', function ($scope, BikelaneRepository) {

        $scope.onFileSelect = function ($files) {
            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];

                var reader = new FileReader();
                reader.onloadend = function () {
                    content = reader.result;

                    var geojsonContent = angular.fromJson(content);

                    var count = 0;
                    
                    var bikelanes = geojsonContent.features.reduce(function (bikelanesOutput, currentFeature) {

                        if (count++ > 10){
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

            }
        };
    });