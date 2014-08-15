'use strict';

angular.module('bikeTouringMapApp')
    .controller('MyTourStepCtrl', function ($scope, $stateParams, $q, TourRepository, StepRepository, MyTourStepViewModelStep, MyTourStepMapService) {

        $scope.onFileSelect = function ($files) {
            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];

                var reader = new FileReader();
                reader.onloadend = function () {
                    content = reader.result;

                    if (typeof content == 'string') {
                        content = (new window.DOMParser()).parseFromString(content, "text/xml");
                    }

                    var geojsonContent = toGeoJSON.gpx(content);

                    var coordinates = geojsonContent.features[0].geometry.coordinates;

                    var points = coordinates.reduce(function (output, c) {

                        var latitude = c[1];
                        var longitude = c[0];
                        var elevation = c[2];

                        output.push({
                            latitude: latitude,
                            longitude: longitude,
                            elevation: elevation
                        });
                        return output;
                    }, []);

                    if (points.length > 1) {

                        // TODO REMOVE $scope.step.cityFrom.name = 'Toulouse';

                        var stepRepository = new StepRepository({
                            _id: $scope.step._id,
                            // TODO REMOVE  cityFrom: $scope.step.cityFrom
                            points: points
                            /*[{
                                "elevation": 472,
                                "longitude": 2.008438,
                                "latitude": 45.047295
                            }, {
                                "elevation": 471,
                                "longitude": 2.008347,
                                "latitude": 45.047709
                            }, {
                                "elevation": 468,
                                "longitude": 2.008261,
                                "latitude": 45.048645
                            }, {
                                "elevation": 468,
                                "longitude": 2.008229,
                                "latitude": 45.048842
                            }, {
                                "elevation": 467,
                                "longitude": 2.008073,
                                "latitude": 45.04905
                            }, {
                                "elevation": 468,
                                "longitude": 2.007789,
                                "latitude": 45.049456
                            }, {
                                "elevation": 470,
                                "longitude": 2.007623,
                                "latitude": 45.049948
                            }, {
                                "elevation": 470,
                                "longitude": 2.007542,
                                "latitude": 45.050369
                            }, {
                                "elevation": 470,
                                "longitude": 2.007376,
                                "latitude": 45.050559
                            }, {
                                "elevation": 466,
                                "longitude": 2.006394,
                                "latitude": 45.051385
                            }, {
                                "elevation": 466,
                                "longitude": 2.006212,
                                "latitude": 45.051544
                            }, {
                                "elevation": 466,
                                "longitude": 2.006105,
                                "latitude": 45.051749
                            }]*/
                        })
                        stepRepository.$update(function () {
                            $scope.step.points = points;
                        });

                    }
                };
                reader.readAsText(file);
            }
        };

        $scope.init = function () {

            $scope.mapConfig = {
                class: 'my-tour-step-map',
                callbacks: {
                    'map:created': function (map) {

                        $scope.$watch('step.points', function (newPoints, oldPoints) {

                            $scope.updateMap();
                        });

                    }
                }
            };

            if (!$stateParams.id) {
                // redirect to 'my tours' page
                $state.go('my-tours', {}, {
                    inherit: false
                });
            } else {
                var deffered = $q.defer();

                // existing step

                $scope.stepId = $stateParams.id;

                // TODO manage errors

                StepRepository.get({
                    id: $scope.stepId
                }, function (step) {

                    // TODO manage errors

                    TourRepository.get({
                        id: step.tourId
                    }, function (tour) {
                        var stepViewModel = new MyTourStepViewModelStep(step, tour);

                        $scope.step = stepViewModel;

                        deffered.resolve(tour);
                    });

                });

                return deffered.promise;

            };
        };

        $scope.updateMap = function () {
            MyTourStepMapService.updateMap($scope.mapConfig, $scope.step);
        };

        return $scope.init();
    });