'use strict';

angular.module('bikeTouringMapApp')
    .controller('MyTourStepCtrl', function ($scope, $stateParams, $q, $upload, $timeout, TourRepository, StepRepository, InterestRepository, SteppointRepository, MyTourStepViewModelStep, MyTourStepMapService, bikeTourMapService) {


        $scope.onPhotoSelect = function ($files) {
            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];

                $scope.photoUploadProgress = 0;

                $scope.upload = $upload.upload({
                    url: '/api/interests/' + $scope.selectedPointOfInterest._id + '/upload-photo',
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
                    url: '/api/steps/upload/trace',
                    data: {
                        stepId: $scope.stepId
                    },
                    file: file,
                }).progress(function (evt) {
                    $scope.steppointsUploadProgress = (100 * evt.loaded / evt.total);
                }).success(function (data, status, headers, config) {

                    $scope.autozoom = true;

                    // update step (distance has been updated)
                    $scope.loadStep();

                    $scope.steppointsUploadProgress = null;
                }).error(function (msg) {
                    alert(msg);
                    $scope.steppointsUploadProgress = null;
                });

            }
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

                    $scope.tour = tour;

                    // retrieve interests
                    InterestRepository.getByStep({
                        stepId: $scope.stepId
                    }, function (interests) {

                        $scope.interests = interests;

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

                        // FIXME à supprimer MyTourStepMapService.updateInterests($scope.mapConfig, $scope.step);

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

                // save after a short delay
                $scope.step.originalModel.$update(function (data, putResponseHeaders) {

                    $scope.loadStep();

                    console.info('Step updated.');
                });
            }
        };

        $scope.updatePoints = function (coordinates) {
            var deffered = $q.defer();

            var stepRepository;
            if (coordinates.length > 1) {

                $scope.step.originalModel.geometry = {
                    coordinates: coordinates,
                    type: 'LineString'
                };

                $scope.step.originalModel.$update(function (step, putResponseHeaders) {
                        console.info('Step updated.');
                        var stepViewModel = new MyTourStepViewModelStep(step, $scope.tour, $scope.interests);

                        $scope.step = stepViewModel;
                        deffered.resolve(step);
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
            var coordinates = points.reduce(function (output, item) {

                output.push([item.longitude, item.latitude]);

                return output;
            }, []);

            $scope.updatePoints(coordinates);
            return coordinates;
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

                            $scope.$watch('interests', function (interests, old) {
                                if (interests) {
                                    eMap.addItemsToGroup(bikeTourMapService.buildInterestsFeatures(interests, {
                                        mode: 'normal',
                                        callbacks: {
                                            'click': function (interest, markerLayer) {
                                                $scope.selectedPointOfInterest = interest;
                                                $scope.editSelectedPointOfInterest = false;
                                                $scope.$apply();
                                            }
                                        }
                                    }), {
                                        name: 'Principaux points d\'intérêt',
                                        control: true,
                                        zoom: {
                                            max: 7
                                        }
                                    });
                                }
                            });

                            $scope.$watch('step', function (step, old) {

                                if (step && step.originalModel && step.originalModel.geometry) {

                                    var traceFeatures = [bikeTourMapService.buildStepTraceFeature(step)];

                                    eMap.addItemsToGroup(traceFeatures, {
                                        name: 'Tracé',
                                        control: true
                                    });

                                    eMap.config.control.fitBoundsFromGeometry(step.originalModel.geometry);

                                    if ($scope.autozoom) {
                                        $scope.autozoom = false;
                                    }

                                }
                            });

                            // load data
                            $scope.loadStep().then(function (step) {
                                if (!step.geometry || step.geometry.coordinates.length === 0) {
                                    // zoom to cityFrom/cityTo
                                    eMap.config.control.fitBoundsFromPoints([step.cityFrom, step.cityTo]);
                                    $scope.autozoom = false;
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

                    // FIXME à supprimer MyTourStepMapService.updateInterests($scope.mapConfig, $scope.step);

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

                    // FIXME à supprimer  MyTourStepMapService.updateInterests($scope.mapConfig, $scope.step);

                    $scope.editSelectedPointOfInterest = false;
                });

            }
        };



        $scope.openCreateMarkerForm = function (size) {

            $('#new-point-of-interest-form').modal('show')
        };

        return $scope.init();
    });