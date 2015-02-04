'use strict';

angular.module('globalbikerWebApp')
    .controller('NavbarCtrl', function ($rootScope, $scope, $location, Auth, $translate) {
        var home;

        $scope.initMenu = function() {
            $translate(['mytours.nav-bar_name']).then(function(trans) {
                $scope.menu = [
                {
                    'title': 'menu.search-a-tour',
                    'link': '/region/france'
                },
                {
                    'title': 'menu.my-tours',
                    'link': '/my-tours',
                    authenticate: true
                },
                {
                    'title': 'menu.contacts',
                    'link': '/contacts'
                }];
            });
        }

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

        $scope.initMenu();
    });
