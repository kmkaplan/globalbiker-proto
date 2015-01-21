(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('AdminCtrl', AdminCtrl);

    function AdminCtrl($scope, $http, Auth, User) {

        // Use the User $resource to fetch all users
        $scope.users = User.query();

        $scope.getCurrentUser = Auth.getCurrentUser;

        $scope.delete = function (user) {
            User.remove({
                id: user._id
            });
            angular.forEach($scope.users, function (u, i) {
                if (u === user) {
                    $scope.users.splice(i, 1);
                }
            });
        };
    };
})();