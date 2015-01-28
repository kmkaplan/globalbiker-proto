(function () {
    'use strict';

    angular.module('globalbikerWebApp')
        .config(function ($stateProvider) {
            $stateProvider
                .state('contacts', {
                    url: '/contacts',
                    templateUrl: 'app/contacts/contacts.html',
                    controller: 'ContactsCtrl'
                });
        });
})();