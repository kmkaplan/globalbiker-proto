'use strict';

angular.module('bikeTouringMapApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('toulouse', {
        url: '/toulouse',
        templateUrl: 'app/toulouse/toulouse.html',
        controller: 'ToulouseCtrl'
      });
  });
