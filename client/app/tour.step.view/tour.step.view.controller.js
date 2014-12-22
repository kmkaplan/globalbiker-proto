(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourStepViewCtrl', TourStepViewCtrl);

    function TourStepViewCtrl(tour, step, $scope, $stateParams, $state, $q, $timeout, Auth, StepRepository) {

        // scope properties
        $scope.isAdmin = Auth.isAdmin;

        // scope methods
        $scope.isAllowedToEdit = isAllowedToEdit;
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

                $scope.$parent.selectStep(tour, step);
                if (isAllowedToEdit(step) && !$scope.inEdition){
                    $scope.$parent.enableEdition(true);
                }
            }
        };

        function createStep() {
            $state.go('tour.create-step');
        }

        function isAllowedToEdit(tour) {
            if (tour && Auth.isLoggedIn() && (Auth.isAdmin() || tour.userId === Auth.getCurrentUser()._id)) {
                return true;
            }
            return false;
        }

        function openTour(tour) {
            $state.go('tour.presentation');
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
                        $state.go('tour.presentation', {}, {
                            'reload': true
                        });
                    });
            }
        }
    }
})();