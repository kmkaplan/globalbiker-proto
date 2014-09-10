'use strict';

angular.module('bikeTouringMapApp')
  .controller('LoginCtrl', function ($scope, Auth, $location, $window) {
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        $scope.connect($scope.user.email, $scope.user.password);
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };

    $scope.connect = function(email, password){
        Auth.login({
          email: email,
          password: password
        })
        .then( function() {
          // Logged in, redirect to home
          $location.path('/my-tours');
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
    };
    
  });
