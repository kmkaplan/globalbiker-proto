'use strict';

angular.module('globalbikerWebApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('region', {
        url: '/region/:reference',
        templateUrl: 'app/region/region.html',
        controller: 'RegionCtrl'
      });
  });
