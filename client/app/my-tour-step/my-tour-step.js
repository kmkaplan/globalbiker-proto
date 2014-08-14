'use strict';

angular.module('bikeTouringMapApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('my-tour-step', {
        url: '/my-tour-step/:id',
        templateUrl: 'app/my-tour-step/my-tour-step.html',
        controller: 'MyTourStepCtrl'
      });
  });