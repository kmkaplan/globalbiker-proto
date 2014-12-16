(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourStepCtrl', TourStepCtrl);

    function TourStepCtrl(tour, $scope, $stateParams, $state, $q, $timeout, Auth) {

        // scope properties
        $scope.isAdmin = Auth.isAdmin;
        $scope.tinymceOptions = {
            height: '200px',
            menubar: false,
            toolbar: 'bold italic bullist numlist outdent indent removeformat subscript superscript'
        };

        // scope methods
        $scope.isAllowedToEdit = isAllowedToEdit;

        // init method
        init();

        function init() {

            if (!tour) {
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

    }
})();