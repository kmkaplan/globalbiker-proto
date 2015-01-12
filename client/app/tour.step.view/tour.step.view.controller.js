(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourStepViewCtrl', TourStepViewCtrl);

    function TourStepViewCtrl(tour, step, $scope, $stateParams, $state, $q, $timeout, Auth, StepRepository, bikeTourMapService, securityService, interestLoaderService, interestsMarkerBuilderService, photoLoaderService) {

        // scope properties
        $scope.securityService = securityService;
        $scope.mapConfig = {};
        $scope.interestsDetails;
        $scope.selection;

        // scope methods
        $scope.editStep = editStep;
        $scope.openStep = openStep;
        $scope.openTour = openTour;
        $scope.deleteStep = deleteStep;
        $scope.createStep = createStep;

        // init method
        init();

        function init() {

            if (!tour || !step) {
                $state.go('home');
            } else {
                $scope.tour = tour;
                $scope.step = step;

                showStepOnMap(tour, step);

                $scope.$watch('step.interests', function (interests) {
                    $scope.interestsDetails = getRelevantInterests(interests);
                });

            }
        };

        function getRelevantInterests(interests) {

            if (interests && interests.length > 0) {

                return interests.reduce(function (interests, interest) {
                    // ['interest', 'hobbies'].indexOf(interest.type) !== -1 || 

                    if (interest.photosIds && interest.photosIds.length > 0) {

                        interest.photos = [];

                        if (interest.photosIds && interest.photosIds.length > 0) {

                            interest.photosIds.reduce(function (o, photoId) {

                                photoLoaderService.getPhoto(photoId).then(function (photo) {

                                    interest.photos.push(photo);

                                });
                            }, null);

                        }
                    }

                    if (interest.description || (interest.photosIds && interest.photosIds.length > 0)) {
                        switch (interest.type) {

                        case 'danger':
                            break;
                        case 'information':
                            break;
                        case 'water-point':
                            break;
                        case 'wc':
                            break;
                        case 'velotoulouse':
                            break;
                        case 'bike-shops':
                            break;
                        case 'accomodation':
                            break;
                        case 'food':
                            break;

                        case 'hobbies':
                        case 'interest':
                            interests.push(interest);
                            break;

                        default:

                            console.warn('Unknown type "%s" for interest %s.', interest.type, interest._id);
                            break;
                        }

                    }

                    return interests;
                }, []);

            } else {
                return [];
            }
        }

        function createStep() {
            $state.go('tour.create-step');
        }

        function openTour(tour) {
            $state.go('tour.view');
        }

        function openStep(step) {
            console.info('Open step %d', step._id);
            $state.go('tour.step.view', {
                stepId: step._id
            }, {});
        };

        function editStep(step) {
            $state.go('tour.step.edit', $stateParams);
        }

        function deleteStep(step) {
            if (confirm('Are you sure do you want to delete this step ?')) {

                StepRepository.remove({
                        id: step._id
                    },
                    function () {
                        $state.go('tour.view', {}, {
                            'reload': true
                        });
                    });
            }
        }

        function showStepOnMap(tour, step) {
            if (tour && step) {
                var features = bikeTourMapService.buildStepTraceFeatures(step, {
                    style: {
                        color: '#34a0b4',
                        width: 3,
                        weight: 6,
                        opacity: 0.8
                    },
                    step: {
                        bounds: {
                            show: true
                        }
                    }
                }, tour);

                var interestsFeatures = interestsMarkerBuilderService.build(step.interests, {
                    click: function (item, event) {
                        // select interest on click
                        $scope.selection = item.model;
                        $scope.isSelectionTabActive = true;
                        $scope.$apply()
                    }
                });

                features = features.concat(interestsFeatures);

                if (features) {
                    $scope.mapConfig.items = features;

                    $scope.mapConfig.bounds = {
                        geometry: step.geometry
                    };
                }
            }
        };
    }
})();