(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourCtrl', TourCtrl);
    
    function TourCtrl(tour, $scope, $stateParams, $state, $q) {

        // init method
        init();

        function init() {

            if (!tour) {
                $state.go('home');
            } else {
                $scope.tour = tour;
            }
        };

    };
})();