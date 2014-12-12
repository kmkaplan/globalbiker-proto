'use strict';

angular.module('globalbikerWebApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('tour', {
        url: '/tour/:id',
        templateUrl: 'app/tour/tour.html',
        controller: 'TourCtrl'
      });
  });