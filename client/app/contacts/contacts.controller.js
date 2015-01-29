(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('ContactsCtrl', ContactsCtrl);

    function ContactsCtrl($scope, $stateParams, $state, $q, MessageRepository) {

        // scope attributes
        // status: 'draft', 'pending', 'error', 'success'
        $scope.status = 'draft';
        $scope.unexpectedError = false;
        $scope.email = {
            address: '',
            subject: '',
            message: ''
        };

        // scope methods
        $scope.sendMessage = sendMessage;

        // init method
        init();

        function init() {

        };

        // TODO validation

        function sendMessage(form) {
            if (form.$valid) {
                $scope.status = 'pending';
                // create resource
                new MessageRepository({
                    email: $scope.email.address,
                    subject: $scope.email.subject,
                    message: $scope.email.message
                }).$save(function (message, putResponseHeaders) {
                    // success
                    $scope.status = 'success';
                }, function (err) {
                    // error
                    console.log(err);
                    $scope.status = 'error';
                });
            }else{
                $scope.status = 'draft';
            }
        }

    };
})();