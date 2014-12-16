(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourPresentationCtrl', TourPresentationCtrl);

    function TourPresentationCtrl(tour, $scope, $stateParams, $state, $q, $timeout, Auth) {

        // scope properties
        $scope.isAdmin = Auth.isAdmin;
        $scope.tinymceOptions = {
            height: '200px',
            menubar: false,
            toolbar: 'bold italic bullist numlist outdent indent removeformat subscript superscript'
        };

        // scope methods
        $scope.isAllowedToEdit = isAllowedToEdit;
        $scope.getStepLabel = getStepLabel;
        $scope.saveTour = saveTour;

        // init method
        init();

        function init() {

            if (!tour) {
                $state.go('home');
            } else {
                $scope.tour = tour;
            }
        };

        function saveTour(tour) {
            var deffered = $q.defer();

            tour.$update(function (data, putResponseHeaders) {
                console.info('Tour updated.');
                // TODO
                // deffered.resolve($scope.loadTour($scope.tourId));
            }, function (err) {
                deffered.reject(err);
            });
            return deffered.promise;
        }

        function isAllowedToEdit(tour) {
            if (tour && Auth.isLoggedIn() && (Auth.isAdmin() || tour.userId === Auth.getCurrentUser()._id)) {
                return true;
            }
            return false;
        }

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