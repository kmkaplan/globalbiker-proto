'use strict';

angular.module('bikeTouringMapApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin-data', {
        url: '/admin-data',
        templateUrl: 'app/admin-data/admin-data.html',
        controller: 'AdminDataCtrl',
        authenticate: true
      });
  });