(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourPresentationCtrl', TourPresentationCtrl);

    function TourPresentationCtrl(tour, $scope, $stateParams, $state, $q, $timeout, Auth) {

        // scope properties
        $scope.isAdmin = Auth.isAdmin;
        $scope.inEdition = false;
        $scope.tinymceOptions = {
            height: '200px',
            menubar: false,
            toolbar: 'bold italic bullist numlist outdent indent removeformat subscript superscript'
        };

        // scope methods
        $scope.isAllowedToEdit = isAllowedToEdit;
        $scope.saveTour = saveTour;
        $scope.editTour = editTour;

        // init method
        init();

        function init() {

            if (!tour) {
                $state.go('home');
            } else {
                $scope.tour = tour;
                
                $scope.$parent.selectTour(tour);
            }
        };

        function editTour(tour) {
            $scope.inEdition = true;
        }

        function saveTour(tour) {
            var deffered = $q.defer();

            var steps = tour.steps;
            
            tour.$update(function (data, putResponseHeaders) {
                console.info('Tour updated.');
                tour.steps = steps;
                $scope.inEdition = false;
            }, function (err) {
                deffered.reject(err);
                $scope.inEdition = false;
            });
            return deffered.promise;
        }

        function isAllowedToEdit(tour) {
            if (tour && Auth.isLoggedIn() && (Auth.isAdmin() || tour.userId === Auth.getCurrentUser()._id)) {
                return true;
            }
            return false;
        }
    }
})();