'use strict';

angular.module('bikeTouringMapApp')
    .controller('NavbarCtrl', function ($scope, $location, Auth, $translate) {
        var home;
        $translate(['home.nav-bar_name','mytours.nav-bar_name']).then(function(trans) {
            $scope.menu = [{
                'title': trans['home.nav-bar_name'],
                'link': '/'
            },
            {
                'title': trans['mytours.nav-bar_name'],
                'link': '/my-tours',
                authenticate: true
            }];
        });


        $scope.isCollapsed = true;
        $scope.isLoggedIn = Auth.isLoggedIn;
        $scope.isAdmin = Auth.isAdmin;
        $scope.getCurrentUser = Auth.getCurrentUser;

        $scope.logout = function () {
            Auth.logout();
            $location.path('/login');
        };

        $scope.isActive = function (route) {
            return route === $location.path();
        };
    });
