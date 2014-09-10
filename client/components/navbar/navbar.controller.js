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

        $scope.languageApp = [
             {
                code    : "en",
                img     : "/assets/images/languages/gb.png",
                name    : "English"
            },
            {
                code    : "fr",
                img     : "/assets/images/languages/fr.png",
                name    : "Français"
            }
        ];

        $scope.languageSelectionApp = function($used) {
            var result = {
                current : null,
                others : []
            }
            for(var i in $scope.languageApp) {
                if ($scope.languageApp[i].code === $used) {
                    result.current = $scope.languageApp[i];
                } else {
                    result.others.push($scope.languageApp[i]);
                }
            }
            return result;
        };

        $scope.languageSelection = $scope.languageSelectionApp($translate.use());

        $scope.switchLanguage = function($code) {
            $translate.use($code);
            $scope.languageSelection = $scope.languageSelectionApp($code);
        };


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
