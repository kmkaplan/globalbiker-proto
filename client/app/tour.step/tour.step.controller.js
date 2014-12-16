(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourStepCtrl', TourStepCtrl);

    function TourStepCtrl(tour, step, $scope, $stateParams, $state, $q, $timeout, Auth) {

        // scope properties
        $scope.isAdmin = Auth.isAdmin;
        $scope.tinymceOptions = {
            height: '200px',
            menubar: false,
            toolbar: 'bold italic bullist numlist outdent indent removeformat subscript superscript'
        };

        // scope methods
        $scope.isAllowedToEdit = isAllowedToEdit;
        $scope.saveStep = saveStep;
        $scope.editStep = editStep;
        $scope.openTour = openTour;

        // init method
        init();

        function init() {

            if (!tour || !step) {
                $state.go('home');
            } else {
                $scope.tour = tour;
                $scope.step = step;
                
                $scope.$parent.selectStep(tour, step);
            }
        };

        function isAllowedToEdit(tour) {
            if (tour && Auth.isLoggedIn() && (Auth.isAdmin() || tour.userId === Auth.getCurrentUser()._id)) {
                return true;
            }
            return false;
        }
        
        function openTour(tour){
            $state.go('tour.presentation');
        }
        
        function editStep(step) {
            $scope.inEdition = true;
        }

        function saveStep(step) {
            var deffered = $q.defer();

            step.$update(function (data, putResponseHeaders) {
                console.info('Step updated.');
                $scope.inEdition = false;
            }, function (err) {
                deffered.reject(err);
                $scope.inEdition = false;
            });
            return deffered.promise;
        }

    }
})();