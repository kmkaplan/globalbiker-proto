'use strict';

angular.module('bikeTouringMapApp')
    .controller('MyToursCtrl', function ($scope, $state, Tour) {
        // Use the Tour $resource to fetch all tours
        $scope.tours = Tour.query();

        $scope.createTour = function () {
            $state.go('my-tour', {

            }, {
                inherit: false
            });
        };

        $scope.viewTour = function (tour) {
            $state.go('my-tour', {
                id: tour._id
            }, {
                inherit: false
            });
        };

        $scope.deleteTour = function (tour) {

            Tour.remove({
                id: tour._id
            });
            angular.forEach($scope.tours, function (t, i) {
                if (t === tour) {
                    $scope.tours.splice(i, 1);
                }
            });

        };


    });
