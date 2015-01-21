(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('SettingsCtrl', SettingsCtrl);

    function SettingsCtrl($scope, User, Auth, UserRepository) {

        // scope properties
        $scope.user = Auth.getCurrentUser();
        $scope.errors = {};

        // scope methods
        $scope.updateProfile = updateProfile;
        $scope.changePassword = changePassword;

        // init method
        init();

        function init() {
        }

        function updateProfile(form){
            new UserRepository($scope.user).$update(function (data, putResponseHeaders) {
                console.info('User updated.');
            }, function (err) {
                console.error(err);
            });
        }
        
        function changePassword(form) {
            $scope.submitted = true;
            if (form.$valid) {
                Auth.changePassword($scope.user.oldPassword, $scope.user.newPassword)
                    .then(function () {
                        $scope.message = 'Password successfully changed.';
                    })
                    .catch(function () {
                        form.password.$setValidity('mongoose', false);
                        $scope.errors.other = 'Incorrect password';
                        $scope.message = '';
                    });
            }
        };
    }

})();