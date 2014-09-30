'use strict';

angular.module('bikeTouringMapApp')
    .controller('MyTourStepCtrl', function ($scope, $stateParams, $q, $upload, $timeout, TourRepository, StepRepository, InterestRepository, SteppointRepository, MyTourStepViewModelStep, MyTourStepMapService) {


        $scope.onPhotoSelect = function ($files) {
            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];

                $scope.photoUploadProgress = 0;

                $scope.upload = $upload.upload({
                    url: '/api/interests/' + $scope.selectedPointOfInterest._id + '/upload',
                    data: {},
                    file: file,
                }).progress(function (evt) {
                    $scope.photoUploadProgress = (100 * evt.loaded / evt.total);
                }).success(function (data, status, headers, config) {
                    $scope.photoUploadProgress = null;
                    $scope.loadStep();
                }).error(function (msg) {
                    alert(msg);
                    $scope.photoUploadProgress = null;
                });

            }
        };

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

                    $scope.autozoom = true;

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
                if ($scope.eMap) {
                    // zoom to cityFrom/cityTo
                    $scope.eMap.config.control.fitBoundsFromPoints([$scope.step.cityFrom, $scope.step.cityTo]);
                }
            }, function () {});

        };

        $scope.removePhoto = function (interest, photo) {
            if (interest && interest._id && photo && photo._id) {
                InterestRepository.deletePhoto({
                    id: interest._id,
                    photoId: photo._id
                }, function (interest) {
                    $scope.loadStep();
                });
            }
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

                        if ($scope.selectedPointOfInterest && $scope.selectedPointOfInterest._id) {
                            $scope.selectedPointOfInterest = interests.reduce(function (output, interest) {
                                if ($scope.selectedPointOfInterest._id === interest._id) {
                                    // update selected interest
                                    return interest;
                                }
                                return output;
                            }, null);
                        }


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

         $scope.saveDescription = function () {
            if ($scope.step && $scope.step.originalModel) {

                if ($scope.step.saveDescriptionTimeout) {
                    // cancel previous timer
                $timeout.cancel($scope.step.saveDescriptionTimeout);
                }

                $scope.step.saveDescriptionTimeout = $timeout(function () {

                    // save after a short delay
                $scope.step.originalModel.$update(function (data, putResponseHeaders) {
                        console.info('Step updated.');
                    });
                }, 500); // delay 500 ms


            }
        };
        
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

            $scope.photoUploadProgress = null;

            $scope.autozoom = true;

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

                            $scope.eMap = eMap;

                            $scope.$watch('steppoints', function (steppoints, old) {
                                if (steppoints) {
                                    MyTourStepMapService.updateTrace($scope.mapConfig, $scope.step, steppoints);
                                    if ($scope.autozoom) {
                                        // zoom to trace
                                        eMap.config.control.fitBoundsFromPoints(steppoints);

                                        $scope.autozoom = false;
                                    }
                                }

                            });

                            // load data
                            $scope.loadStep().then(function (step) {
                                $scope.loadSteppoints().then(function (steppoints) {
                                    if (steppoints.length === 0) {
                                        // zoom to cityFrom/cityTo
                                        eMap.config.control.fitBoundsFromPoints([step.cityFrom, step.cityTo]);
                                        $scope.autozoom = false;
                                    }
                                });
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
                        },
                        'interest:clicked': function (marker, eMap, item, itemLayer, e) {
                            $scope.selectedPointOfInterest = marker;
                            $scope.editSelectedPointOfInterest = false;
                            $scope.$apply();
                        }
                    }
                };

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
                    description: $scope.newMarker.description,
                    priority: $scope.newMarker.priority
                });
                interest.$save(function (u, putResponseHeader) {

                    $('#new-point-of-interest-form').modal('hide')

                    $scope.step.interests.push(interest);

                    MyTourStepMapService.updateInterests($scope.mapConfig, $scope.step);

                    $scope.selectedPointOfInterest = interest;
                    $scope.editSelectedPointOfInterest = false;
                });

            }
        };

        $scope.submitEditPointForm = function (form) {

            if (form.$valid) {

                var interest = new InterestRepository({
                    stepId: $scope.step._id,
                    latitude: $scope.selectedPointOfInterest.latitude,
                    longitude: $scope.selectedPointOfInterest.longitude,
                    type: $scope.selectedPointOfInterest.type,
                    name: $scope.selectedPointOfInterest.name,
                    description: $scope.selectedPointOfInterest.description,
                    priority: $scope.selectedPointOfInterest.priority
                });
                interest.$update({
                    id: $scope.selectedPointOfInterest._id
                }, function (u, putResponseHeader) {

                    $('#new-point-of-interest-form').modal('hide')

                    $scope.step.interests.push(interest);

                    MyTourStepMapService.updateInterests($scope.mapConfig, $scope.step);

                    $scope.editSelectedPointOfInterest = false;
                });

            }
        };



        $scope.openCreateMarkerForm = function (size) {

            $('#new-point-of-interest-form').modal('show')
        };

        return $scope.init();
    });