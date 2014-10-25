'use strict';

angular.module('globalbikerWebApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin-data', {
        url: '/admin-data',
        templateUrl: 'app/admin-data/admin-data.html',
        controller: 'AdminDataCtrl',
        authenticate: true
      });
  });