'use strict';

angular.module('globalbikerWebApp')
    .controller('NavbarCtrl', function ($rootScope, $scope, $location, Auth, $translate) {
        var home;

        $scope.initMenu = function() {
            $translate(['mytours.nav-bar_name']).then(function(trans) {
                $scope.menu = [
                {
                    'title': "Toulouse",
                    'link': '/toulouse'
                },
                {
                    'title': trans['mytours.nav-bar_name'],
                    'link': '/my-tours',
                    authenticate: true
                }];
            });
        }

        $rootScope.$on('$translateChangeSuccess', function () {
            $scope.initMenu();
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
            $translate.use($code).then($scope.initMenu);
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

        $scope.initMenu();
    });
