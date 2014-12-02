'use strict';

angular.module('globalbikerWebApp')
    .controller('MyTourStepCtrl', function ($scope, $stateParams, $q, $upload, $timeout, TourRepository, StepRepository, InterestRepository, MyTourStepMapService, bikeTourMapService, LicenseRepository, PhotoRepository, interestLoaderService, stepLoaderService) {

        $scope.licenses = LicenseRepository.query();

        $scope.getLicense = function (photo) {
            if (!photo || !photo.licenseId) {
                return null;
            }
            var license = $scope.licenses.reduce(function (photoLicense, license) {
                    if (license._id === photo.licenseId) {
                        return license;
                    }
                    return photoLicense;
                },
                null);
            return license;
        }

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

        $scope.photosupload = {
            // TODO manage multiple photos
            multiple: false,
            url: function () {
                return '/api/photos/upload';
            },
            data: function () {
                return {
                    geometry: $scope.selectedPointOfInterest.geometry
                }
            },
            callbacks: {
                success: function (photo) {

                    $scope.selectedPointOfInterest.photos.push(photo);
                    $scope.selectedPointOfInterest.photosIds.push(photo._id);

                    $scope.selectedPointOfInterest.$update(function (data, putResponseHeaders) {

                        $scope.loadStep();

                        console.info('Photo uploaded.');
                    });



                }
            }
        };

        $scope.deleteTrace = function () {

            $scope.step.geometry = null;
            $scope.updateStep();

        };

        $scope.removePhoto = function (interest, photo) {
            if (interest && interest._id && photo && photo._id) {

                var index = $scope.selectedPointOfInterest.photos.indexOf(photo);
                if (index > -1) {
                    $scope.selectedPointOfInterest.photos.splice(index, 1);
                }

                index = $scope.selectedPointOfInterest.photosIds.indexOf(photo._id);
                if (index > -1) {
                    $scope.selectedPointOfInterest.photosIds.splice(index, 1);
                }

                $scope.selectedPointOfInterest.$update(function (data, putResponseHeaders) {

                    // TODO remove photo only if it is not used anymore

                    /* PhotoRepository.remove({
                            id: photo._id
                        },
                        function () {
                            $scope.loadStep();
                            console.info('Photo removed.');
                        });*/
                });
            }
        };

        $scope.updatePhoto = function (photo) {
            if (photo && photo._id) {

                photo.$update(function (data, putResponseHeaders) {
                    console.info('Photo updated.');
                });
            }
        };


        $scope.loadStep = function () {

            var deffered = $q.defer();

            return stepLoaderService.loadStep($scope.stepId, {
                tour: true,
                step: {
                    distances: true,
                    interests: {},
                    photosAround: {
                        distance: 1000
                    }
                }
            }).then(function (step) {

                if ($scope.selectedPointOfInterest && $scope.selectedPointOfInterest._id) {
                    $scope.selectedPointOfInterest = interests.reduce(function (output, interest) {
                        if ($scope.selectedPointOfInterest._id === interest._id) {
                            // update selected interest
                            return interest;
                        }
                        return output;
                    }, null);
                }

                $scope.step = step;

                deffered.resolve($scope.step);
            });

        }

        $scope.editProperties = function () {
            $scope.isEditProperties = true;
        };

        $scope.saveProperties = function () {
            $scope.isEditProperties = false;

            $scope.updateStep();

        };
        $scope.updateStep = function () {
            if ($scope.step) {

                // save after a short delay
                $scope.step.$update(function (data, putResponseHeaders) {

                    $scope.loadStep();

                    console.info('Step updated.');
                });
            }
        };

        $scope.updatePoints = function (coordinates) {
            var deffered = $q.defer();

            var stepRepository;
            if (coordinates.length > 1) {

                $scope.step.geometry = {
                    coordinates: coordinates,
                    type: 'LineString'
                };

                $scope.step.$update(function (step, putResponseHeaders) {
                        console.info('Step updated.');
                       /* var stepViewModel = new MyTourStepViewModelStep(step, $scope.tour, $scope.step.interests);

                        $scope.step = stepViewModel;*/
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

                // load data
                $scope.loadStep().then(function (step) {

                });

                $scope.mapConfig = {
                    class: 'my-tour-step-map',
                    drawingOptions: {
                        polyline: true,
                        marker: true
                    },
                    callbacks: {
                        'map:created': function (eMap) {

                            $scope.eMap = eMap;

                            $scope.$watch('step.interests', function (interests, old) {
                                if (interests) {
                                    eMap.addItemsToGroup(bikeTourMapService.buildInterestsFeatures(interests, {
                                        mode: 'normal',
                                        callbacks: {
                                            'click': function (interest, markerLayer) {

                                                interestLoaderService.loadDetails(interest, {
                                                    interest: {
                                                        photos: true
                                                    }
                                                }).then(function (interest) {
                                                    $scope.selectedPointOfInterest = interest;
                                                    $scope.editSelectedPointOfInterest = false;
                                                });
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

                                if (step && step.geometry) {

                                    var traceFeatures = bikeTourMapService.buildStepTraceFeatures(step, {
                                        style: {
                                            color: '#34a0b4',
                                            width: 3,
                                            weight: 6,
                                            opacity: 0.8
                                        }
                                    });

                                    eMap.addItemsToGroup(traceFeatures, {
                                        name: 'Tracé',
                                        control: true
                                    });

                                    eMap.config.control.fitBoundsFromGeometry(step.geometry);

                                    if ($scope.autozoom) {
                                        $scope.autozoom = false;
                                    }

                                } else if (!step.geometry || step.geometry.coordinates.length === 0) {
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

                                if ($scope.step.geometry) {
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
                        'interest:clicked': function (interest, eMap, item, itemLayer, e) {}
                    }
                };

            }
            
            $scope.$watch('selectedPointOfInterest.photoToAdd', function(photo){
                if (photo){
                    $scope.selectedPointOfInterest.photos.push(photo);
                    $scope.selectedPointOfInterest.photosIds.push(photo._id);
                    $scope.selectedPointOfInterest.$update(function (data, putResponseHeaders) {

                        $scope.loadStep();

                        console.info('Photo associated.');
                    });
                }
            });

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

                    $('#new-point-of-interest-form').modal('hide');

                    $scope.step.interests = $scope.step.interests.concat([interest]);

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
                    priority: $scope.selectedPointOfInterest.priority,
                    photosIds: $scope.selectedPointOfInterest.photosIds
                });
                interest.$update({
                    id: $scope.selectedPointOfInterest._id
                }, function (u, putResponseHeader) {
                    //       $scope.selectedPointOfInterest = null;
                    $scope.editSelectedPointOfInterest = false;
                });

            }
        };



        $scope.openCreateMarkerForm = function (size) {

            $('#new-point-of-interest-form').modal('show')
        };

        return $scope.init();
    });