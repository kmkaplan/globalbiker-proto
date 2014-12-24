(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourStepEditCtrl', TourStepEditCtrl);

    function TourStepEditCtrl(tour, step, $scope, $stateParams, $state, $q, $timeout, Auth, StepRepository, bikeTourMapService, securityService, interestsMarkerBuilderService, PhotoRepository) {

        // scope properties
        $scope.mapConfig = {
            url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
        };

        $scope.securityService = securityService;
        $scope.interest = null

        $scope.tinymceOptions = {
            height: '200px',
            menubar: false,
            toolbar: 'bold italic bullist numlist outdent indent removeformat subscript superscript'
        };

        // scope methods
        $scope.saveStep = saveStep;
        $scope.openTour = openTour;
        $scope.saveOrUpdateInterest = saveOrUpdateInterest;
        $scope.removeInterest = removeInterest;
        $scope.selectPhoto = selectPhoto;

        // init method
        init();

        function init() {

            if (!tour || !step) {
                $state.go('home');
            } else {
                if (securityService.isTourEditable(tour)) {
                    $scope.tour = tour;
                    $scope.step = step;

                    showStepOnMap(tour, step);

                    loadPhotos(step);

                } else {
                    $state.go('tour.step.view');
                }
            }
        };

        function loadPhotos(step) {
            PhotoRepository.searchAroundStep({
                    stepId: step._id,
                    distance: 10000
                }, function (photos) {
                    step.photos = photos;
                },
                function (err) {
                    console.error(err);
                });
        }

        function selectPhoto(photo) {
            $scope.step.photo = photo;
            $scope.step.photoId = photo._id;
        }

        function openTour(tour) {
            $state.go('tour.presentation');
        }

        function saveStep(step) {
            var deffered = $q.defer();

            var interests = step.interests;
            var photo = step.photo;

            step.$update(function (data, putResponseHeaders) {
                console.info('Step updated.');
            }, function (err) {
                deffered.reject(err);
            }).finally(function () {
                $state.go('tour.step.view', $stateParams);
                step.interests = interests;
                step.photo = photo;
            });
            return deffered.promise;
        }

        function removeInterest(interest) {
            $scope.step.interests = $scope.step.interests.reduce(function (interests, currentInterest) {
                if (currentInterest._id !== interest._id) {
                    interests.push(currentInterest);
                }
                return interests;
            }, []);
            $scope.interest = null;
            showStepOnMap($scope.tour, $scope.step);
        }

        function saveOrUpdateInterest(interest, isNew) {
            if (isNew) {
                $scope.step.interests.push(interest);
            } else {
                $scope.step.interests = $scope.step.interests.reduce(function (interests, currentInterest) {
                    if (currentInterest._id === interest._id) {
                        interests.push(interest);
                    } else {
                        interests.push(currentInterest);
                    }
                    return interests;
                }, []);
            }
            loadPhotos(step);
            $scope.interest = null;
            showStepOnMap($scope.tour, $scope.step);
        }

        function showStepOnMap(tour, step) {
            if (tour && step) {
                var traceFeatures = bikeTourMapService.buildStepTraceFeatures(step, {
                    style: {
                        color: '#34a0b4',
                        width: 3,
                        weight: 6,
                        opacity: 0.8
                    },
                    label: function (step) {
                        return getStepLabel(step);
                    },
                    step: {
                        bounds: {
                            show: true
                        }
                    },
                    callbacks: {
                        'click': function (step) {
                            $state.go('step-details', {
                                id: step._id
                            }, {
                                inherit: false
                            });
                        }
                    }
                }, tour);

                var interestsFeatures = interestsMarkerBuilderService.build(step.interests, {
                    click: function (feature, mouseEvent) {
                        $scope.interest = feature.model.interest;
                        console.log('Edit interest', $scope.interest);
                        $scope.$apply();
                    }
                });

                interestsFeatures.reduce(function (o, feature) {
                    var interest = feature.model.interest;
                    feature.properties.label = interest.name + ' (click to edit)';
                }, null);


                traceFeatures = traceFeatures.concat(interestsFeatures);

                if (traceFeatures) {
                    $scope.mapConfig.items = traceFeatures;

                    $scope.mapConfig.bounds = {
                        geometry: step.geometry
                    };
                }

                if ($scope.securityService.isTourEditable(tour)) {

                    $scope.mapConfig.drawingTools = [{
                        type: 'marker',
                        created: function (map, config, geojson, e) {
                            $scope.interest = {
                                type: 'interest',
                                stepId: step._id,
                                geometry: geojson.geometry
                            };
                            console.log('Create interest', $scope.interest);
                            $scope.$apply();
                        }
                    }, {
                        type: 'polyline',
                        created: function (map, config, geojson, e) {
                            console.log('Trace drawn', geojson.geometry.coordinates);
                            step.geometry = geojson.geometry;

                            saveStep(step).then(function (step) {
                                showStepOnMap(tour, step);
                                $scope.$apply();
                            });
                        }
                    }];

                }

            }
        };



        function getStepLabel(step) {
            if (step.cityFrom.name === step.cityTo.name) {
                // same source & destination
                return step.cityFrom.name;
            } else {
                return 'From ' + step.cityFrom.name + ' to ' + step.cityTo.name;
            }
        };

    }
})();