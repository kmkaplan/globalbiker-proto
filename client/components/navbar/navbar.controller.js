'use strict';

angular.module('bikeTouringMapApp')
    .controller('NavbarCtrl', function ($scope, $location, Auth) {
        $scope.menu = [{
                'title': 'Home',
                'link': '/'
    },
            {
                'title': 'Create a new tour',
                'link': '/my-tour'
    },
            {
                'title': 'Create a new route',
                'link': '/route-details'
    }];

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