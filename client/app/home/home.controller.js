'use strict';

angular.module('bikeTouringMapApp')
    .controller('HomeCtrl', function ($scope, MailingRepository, $translate) {
        $scope.addMail = function ($email, $) {
            var mailingRepository;
            mailingRepository = new MailingRepository({
                email: $email
            });
            mailingRepository.$save(function () {
                $scope.mailSuccess = true;
            });
        }

        $scope.languageApp = [
            {
                code: "en",
                img: "/assets/images/languages/gb.png",
                name: "English"
            },
            {
                code: "fr",
                img: "/assets/images/languages/fr.png",
                name: "Français"
            }
        ];

        $scope.languageSelectionApp = function ($used) {
            var result = {
                current: null,
                others: []
            }
            for (var i in $scope.languageApp) {
                if ($scope.languageApp[i].code === $used) {
                    result.current = $scope.languageApp[i];
                } else {
                    result.others.push($scope.languageApp[i]);
                }
            }
            return result;
        };

        $scope.languageSelection = $scope.languageSelectionApp($translate.use());

        $scope.switchLanguage = function ($code) {
            $translate.use($code);
            $scope.languageSelection = $scope.languageSelectionApp($code);
        };

    });