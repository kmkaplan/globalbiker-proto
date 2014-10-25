'use strict';

angular.module('globalbikerWebApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('my-tours', {
        url: '/my-tours',
        templateUrl: 'app/my-tours/my-tours.html',
        controller: 'MyToursCtrl',
        authenticate: true
      });
  });
