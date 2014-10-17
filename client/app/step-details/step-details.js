'use strict';

angular.module('bikeTouringMapApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('step-details', {
        url: '/step-details/:id',
        templateUrl: 'app/step-details/step-details.html',
        controller: 'StepDetailsCtrl'
      });
  });