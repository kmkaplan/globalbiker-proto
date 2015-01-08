'use strict';

angular.module('globalbikerWebApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('home2', {
        url: '/',
        templateUrl: 'app/home/home.old.html',
        controller: 'HomeOldCtrl'
      })/*.state('home', {
        url: '/',
        templateUrl: 'app/home/home.html',
        controller: 'HomeCtrl'
      })*/;
  });
