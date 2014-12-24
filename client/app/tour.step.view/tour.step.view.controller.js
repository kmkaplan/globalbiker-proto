(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourStepViewCtrl', TourStepViewCtrl);

    function TourStepViewCtrl(tour, step, $scope, $stateParams, $state, $q, $timeout, Auth, StepRepository, bikeTourMapService, securityService, interestLoaderService, interestsMarkerBuilderService, photoLoaderService) {

        // scope properties
        $scope.securityService = securityService;
        $scope.mapConfig = {};
        $scope.interestsDetails;

        // scope methods
        $scope.editStep = editStep;
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
                    if (interests && interests.length > 0) {
                        
                        interests = interests.reduce(function(interests, interest){
                            // ['interest', 'hobbies'].indexOf(interest.type) !== -1 || 
                            if (interest.photosIds && interest.photosIds.length > 0){
                                
                                interest.photos = [];
                                
                                if (interest.photosIds && interest.photosIds.length > 0){
                                    
                                    interest.photosIds.reduce(function(o, photoId){
                                        
                                         photoLoaderService.getPhoto(photoId).then(function(photo){

                                             interest.photos.push(photo);
                                             
                                         });
                                    }, null);
                                   
                                }
                                
                                interests.push(interest);
                            } 
                            return interests;
                        }, []);
                        
                        $scope.interestsDetails = interests
                    }
                });

            }
        };

        function createStep() {
            $state.go('tour.create-step');
        }

        function openTour(tour) {
            $state.go('tour.view');
        }

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
                var traceFeatures = bikeTourMapService.buildStepTraceFeatures(step, {
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

                traceFeatures = traceFeatures.concat(interestsMarkerBuilderService.build(step.interests));

                if (traceFeatures) {
                    $scope.mapConfig.items = traceFeatures;

                    $scope.mapConfig.bounds = {
                        geometry: step.geometry
                    };
                }
            }
        };
    }
})();