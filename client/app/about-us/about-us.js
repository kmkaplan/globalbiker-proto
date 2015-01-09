(function () {
    'use strict';

    angular.module('globalbikerWebApp')
        .config(function ($stateProvider) {
            $stateProvider
                .state('about', {
                    url: '/about',
                    templateUrl: 'app/about-us/about-us.html',
                    controller: 'AboutUsCtrl'
                });
        });
})();