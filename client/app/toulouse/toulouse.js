'use strict';

angular.module('globalbikerWebApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('toulouse', {
        url: '/toulouse',
        templateUrl: 'app/toulouse/toulouse.html',
        controller: 'ToulouseCtrl'
      });
  });
