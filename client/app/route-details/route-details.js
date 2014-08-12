'use strict';

angular.module('bikeTouringMapApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('route-details', {
        url: '/route-details',
        templateUrl: 'app/route-details/route-details.html',
        controller: 'RouteDetailsCtrl'
      });
  });