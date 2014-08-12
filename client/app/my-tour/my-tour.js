'use strict';

angular.module('bikeTouringMapApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('my-tour', {
        url: '/my-tour',
        templateUrl: 'app/my-tour/my-tour.html',
        controller: 'MyTourCtrl'
      });
  });