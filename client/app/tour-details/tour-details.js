'use strict';

angular.module('globalbikerWebApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('tour-details', {
        url: '/tour-details/:id',
        templateUrl: 'app/tour-details/tour-details.html',
        controller: 'TourDetailsCtrl'
      });
  });