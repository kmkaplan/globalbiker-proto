(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('ContactsCtrl', ContactsCtrl);

    function ContactsCtrl($scope, $stateParams, $state, $q, MessageRepository) {

        // scope attributes
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
                // create resource
                new MessageRepository({
                    email: $scope.email.address,
                    subject: $scope.email.subject,
                    message: $scope.email.message
                }).$save(function (message, putResponseHeaders) {
                    // success
                    console.log('ok');
                }, function (err) {
                    // error
                    console.log(err);
                });
            }
        }

    };
})();