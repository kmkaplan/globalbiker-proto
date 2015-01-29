(function () {
    'use strict';

    angular.module('globalbikerWebApp')
        .config(function ($stateProvider) {
            $stateProvider
                .state('press', {
                    url: '/press',
                    templateUrl: 'app/press/press.html',
                    controller: 'PressCtrl'
                });
        });
})();