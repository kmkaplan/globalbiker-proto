'use strict';

angular.module('bikeTouringMapApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('my-tours', {
        url: '/my-tours',
        templateUrl: 'app/my-tours/my-tours.html',
        controller: 'MyToursCtrl'
      });
  });