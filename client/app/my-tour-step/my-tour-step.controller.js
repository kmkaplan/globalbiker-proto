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

                    $scope.updatePoints(points);
                };
                reader.readAsText(file);
            }
        };

        $scope.calculateDistanceFromPoints = function (points) {

            var latLngs = points.reduce(function (output, point) {
                output.push(L.latLng(
                    point.latitude,
                    point.longitude
                ))
                return output;

            }, []);

            return L.GeometryUtil.length(latLngs);
        };


        $scope.deleteTrace = function () {
            $scope.updatePoints([]);
        };

        $scope.updatePoints = function (points) {
            var stepRepository;
            if (points.length > 1) {
                var distance = $scope.calculateDistanceFromPoints(points);

                stepRepository = new StepRepository({
                    _id: $scope.step._id,
                    points: points,
                    distance: distance
                })
            } else {
                stepRepository = new StepRepository({
                    _id: $scope.step._id,
                    points: [],
                    distance: 0
                })
            }
            stepRepository.$update(function (step) {
                $scope.step.points = points;
                $scope.step.distance = distance;
                $scope.step.readableDistance = L.GeometryUtil.readableDistance(distance, 'metric');
                $scope.step.isTraceInEdition = false;
            });

        };

        $scope.updatePointsFromMapEditor = function (points) {
            var stepPoints = points.reduce(function (output, item) {

                output.push({
                    latitude: item.latitude,
                    longitude: item.longitude
                });

                return output;
            }, []);

            $scope.updatePoints(stepPoints);
            return stepPoints;
        };

        $scope.init = function () {

            $scope.mapConfig = {
                class: 'my-tour-step-map',
                drawingOptions: {
                    polyline: true,
                    marker: true
                },
                callbacks: {
                    'map:created': function (eMap) {
                        $scope.$watch('step.points', function (newPoints, oldPoints) {

                            // TODO only update trace
                            $scope.updateMap();
                        });

                    },
                    'draw:created': function (eMap, points, e) {

                        if (e.layerType === 'marker') {

                            var markers = $scope.step.markers.slice();

                            var type;

                            switch ($scope.step.markers.length % 4) {
                            case 0:
                                type = 'interest';
                                break;
                            case 1:
                                type = 'bike-shops';
                                break;
                            case 2:
                                type = 'food';
                                break;
                            case 3:
                                type = 'danger';
                                break;
                            }

                            markers.push({
                                latitude: points.latitude,
                                longitude: points.longitude,
                                type: type
                            });

                            var stepRepository = new StepRepository({
                                _id: $scope.step._id,
                                markers: markers
                            });
                            stepRepository.$update(function (step) {
                                $scope.step.markers = markers;

                                // TODO only update markers
                                $scope.updateMap();
                            });


                        } else if (e.layerType === 'polyline') {

                            if ($scope.step.points && $scope.step.points.length != 0) {
                                if (!confirm('Are you sure do you want to replace the existing trace with the new one?')) {
                                    return;
                                }
                            }
                            $scope.updatePointsFromMapEditor(points);

                        }
                    },
                    'draw:edited': function (eMap, points, e) {

                        if (!confirm('Are you sure do you want to update the existing trace?')) {
                            return;
                        }

                        $scope.updatePointsFromMapEditor(points);
                    },
                    'draw:deleted': function (eMap, points, e) {

                        if (!confirm('Are you sure do you want to remove existing trace?')) {
                            return;
                        }

                        $scope.updatePointsFromMapEditor([]);
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