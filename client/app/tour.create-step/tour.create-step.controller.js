(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourCreateStepCtrl', TourCreateStepCtrl);

    function TourCreateStepCtrl(tour, $scope, $q, $state, Auth, StepRepository) {

        // scope properties
        $scope.isAdmin = Auth.isAdmin;
        $scope.tinymceOptions = {
            height: '200px',
            menubar: false,
            toolbar: 'bold italic bullist numlist outdent indent removeformat subscript superscript'
        };
        $scope.step = {
            tourId: tour._id
        };

        // scope methods
        $scope.isAllowedToEdit = isAllowedToEdit;
        $scope.createStep = createStep;
        $scope.progress = progress;

        // init method
        init();

        function init() {

            if (!tour || !isAllowedToEdit(tour)) {
                $state.go('home');
            } else {
                $scope.tour = tour;
            }
        };

        function isAllowedToEdit(tour) {
            if (tour && Auth.isLoggedIn() && (Auth.isAdmin() || tour.userId === Auth.getCurrentUser()._id)) {
                return true;
            }
            return false;
        }

        function progress() {
            var progress = 0;
            if ($scope.step && $scope.step.cityFrom && $scope.step.cityTo) {
                progress++;
                if ($scope.step.interest && $scope.step.difficulty) {
                    progress++;
                    if ($scope.step.description) {
                        progress++;
                    }
                }
            }
            return progress;
        }

        function createStep(step) {
            var deffered = $q.defer();

            // create resource
            new StepRepository(step).$save(function (step, putResponseHeaders) {
                // success
                deffered.resolve(step);
                $state.go('tour.step', {
                    id: tour._id,
                    stepId: step._id
                }, {
                    reload: true
                });
            }, function (err) {
                // error
                deffered.reject(err);
            });

            return deffered.promise;
        }

    }
})();