(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourStepEditCtrl', TourStepEditCtrl);

    function TourStepEditCtrl(tour, step, $scope, $stateParams, $state, $q, $timeout, Auth, StepRepository) {

        // scope properties
        $scope.isAdmin = Auth.isAdmin;

        $scope.tinymceOptions = {
            height: '200px',
            menubar: false,
            toolbar: 'bold italic bullist numlist outdent indent removeformat subscript superscript'
        };

        // scope methods
        $scope.saveStep = saveStep;
        $scope.openTour = openTour;

        // init method
        init();

        function init() {

            if (!tour || !step) {
                $state.go('home');
            } else {
                if (isAllowedToEdit(step)) {
                    $scope.tour = tour;
                    $scope.step = step;

                    $scope.$parent.selectStep(tour, step);
                } else {
                    $state.go('tour.step.view');
                }
            }
        };

        function isAllowedToEdit(tour) {
            if (tour && Auth.isLoggedIn() && (Auth.isAdmin() || tour.userId === Auth.getCurrentUser()._id)) {
                return true;
            }
            return false;
        }

        function openTour(tour) {
            $state.go('tour.presentation');
        }

        function saveStep(step) {
            var deffered = $q.defer();

            step.$update(function (data, putResponseHeaders) {
                console.info('Step updated.');
            }, function (err) {
                deffered.reject(err);
            }).finally(function () {
                $state.go('tour.step.view', $stateParams);
            });
            return deffered.promise;
        }

    }
})();