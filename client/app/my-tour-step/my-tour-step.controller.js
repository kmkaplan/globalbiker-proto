'use strict';

angular.module('bikeTouringMapApp')
    .controller('MyTourStepCtrl', function ($scope, $stateParams, $q, TourRepository, StepRepository, MyTourStepViewModelStep, MyTourStepMapService) {

        $scope.init = function () {

            $scope.mapConfig = {
                class: 'my-tour-step-map'
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
                        id: step.tour
                    }, function (tour) {
                        var stepViewModel = new MyTourStepViewModelStep(step, tour);

                        $scope.step = stepViewModel;

                        $scope.updateMap();

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