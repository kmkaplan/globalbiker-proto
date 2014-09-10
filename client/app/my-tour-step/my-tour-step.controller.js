'use strict';

angular.module('bikeTouringMapApp')
    .controller('MyTourStepCtrl', function ($scope, $stateParams, $q, $upload, TourRepository, StepRepository, InterestRepository, SteppointRepository, MyTourStepViewModelStep, MyTourStepMapService) {

        $scope.onFileSelect = function ($files) {
            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];

                $scope.steppointsUploadProgress = 0;

                $scope.upload = $upload.upload({
                    url: '/api/steppoints/upload',
                    data: {
                        stepId: $scope.stepId
                    },
                    file: file,
                }).progress(function (evt) {
                    $scope.steppointsUploadProgress = (100 * evt.loaded / evt.total);
                }).success(function (data, status, headers, config) {
                    // update points
                    $scope.loadSteppoints();
                    // update step (distance has been updated)
                    $scope.loadStep();
                    $scope.steppointsUploadProgress = null;
                }).error(function (msg) {
                    alert(msg);
                    $scope.steppointsUploadProgress = null;
                });

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

            SteppointRepository.deleteByStep({
                stepId: $scope.stepId
            }, function () {
                $scope.steppoints = [];
            }, function () {});

        };

        $scope.loadStep = function () {
            var deffered = $q.defer();

            // retrieve step
            StepRepository.get({
                id: $scope.stepId
            }, function (step) {

                // retrieve tour
                TourRepository.get({
                    id: step.tourId
                }, function (tour) {

                    // retrieve interests
                    InterestRepository.getByStep({
                        stepId: $scope.stepId
                    }, function (interests) {

                        var stepViewModel = new MyTourStepViewModelStep(step, tour, interests);

                        $scope.step = stepViewModel;

                        MyTourStepMapService.updateInterests($scope.mapConfig, $scope.step);

                        deffered.resolve($scope.step);
                    }, function () {
                        console.error('Unexpected error while retrieving interests of step %s', $scope.stepId);
                        deffered.reject('Unexpected error while retrieving interests of step.');
                    });

                }, function () {
                    console.error('Unexpected error while retrieving tour %s', step.tourId);
                    deffered.reject('Unexpected error while retrieving tour.');
                });

            }, function () {
                console.error('Unexpected error while retrieving step %s', $scope.stepId);
                deffered.reject('Unexpected error while retrieving step.');
            });

            return deffered.promise;
        }

        $scope.loadSteppoints = function () {
            var deffered = $q.defer();

            $scope.steppointsLoading = true;

            SteppointRepository.getByStep({
                    stepId: $scope.stepId
                }, function (steppoints) {
                    $scope.steppoints = steppoints;

                    $scope.steppointsLoading = false;

                    deffered.resolve(steppoints);
                },
                function () {
                    $scope.steppointsLoading = false;
                    console.error('Unexpected error while retrieving steppoints of step %s', $scope.stepId);
                    deffered.reject('Unexpected error while retrieving steppoints.');
                });

            return deffered.promise;
        };

        $scope.updatePoints = function (points) {
            var deffered = $q.defer();

            var stepRepository;
            if (points.length > 1) {

                SteppointRepository.updateByStep({
                        stepId: $scope.stepId,
                        points: points
                    }, function () {

                        $scope.loadStep();
                        deffered.resolve($scope.loadSteppoints());
                    },
                    function () {
                        console.error('Unexpected error while updating steppoints of step %s', $scope.stepId);
                        deffered.reject('Unexpected error while updating steppoints.');
                    });


            } else {
                effered.reject('Invalid size.');
            }

            return deffered.promise;
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

            if (!$stateParams.id) {
                // redirect to 'my tours' page
                $state.go('my-tours', {}, {
                    inherit: false
                });
            } else {
                // existing step

                $scope.stepId = $stateParams.id;

                $scope.mapConfig = {
                    class: 'my-tour-step-map',
                    drawingOptions: {
                        polyline: true,
                        marker: true
                    },
                    callbacks: {
                        'map:created': function (eMap) {
                            $scope.$watch('steppoints', function (steppoints, old) {
                                if (steppoints) {
                                    MyTourStepMapService.updateTrace($scope.mapConfig, $scope.step, steppoints);
                                    eMap.config.control.fitBoundsFromPoints(steppoints);
                                }
                            });
                        },
                        'draw:created': function (eMap, points, e) {

                            if (e.layerType === 'marker') {

                                $scope.newMarker = {
                                    latitude: points.latitude,
                                    longitude: points.longitude
                                };

                                $scope.openCreateMarkerForm();

                            } else if (e.layerType === 'polyline') {

                                if ($scope.steppoints && $scope.steppoints.length != 0) {
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
                $scope.loadStep().then(function () {
                    $scope.loadSteppoints();
                });


            }

        };

        $scope.updateMarker = function (marker) {
            marker.isInEdition = false;
        };

        $scope.submitCreatePointForm = function (form) {

            if (form.$valid) {

                var interest = new InterestRepository({
                    stepId: $scope.step._id,
                    latitude: $scope.newMarker.latitude,
                    longitude: $scope.newMarker.longitude,
                    type: $scope.newMarker.type,
                    name: $scope.newMarker.name,
                    description: $scope.newMarker.description
                });
                interest.$save(function (u, putResponseHeader) {

                    $('#new-point-of-interest-form').modal('hide')

                    $scope.step.interests.push(interest);

                    MyTourStepMapService.updateInterests($scope.mapConfig, $scope.step);
                });

            }
        };

        $scope.openCreateMarkerForm = function (size) {

            $('#new-point-of-interest-form').modal('show')
        };

        return $scope.init();
    });