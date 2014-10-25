'use strict';

angular.module('globalbikerWebApp')
    .controller('SignupCtrl', function ($scope, Auth, $location, $window, MailingRepository) {
        $scope.user = {};
        $scope.errors = {};
        $scope.addMail = function ($email, $) {
            var mailingRepository;
            mailingRepository = new MailingRepository({
                email: $email
            });
            mailingRepository.$save(function () {
                $scope.mailSuccess = true;
            });
        }
        $scope.register = function (form) {
            $scope.submitted = true;

            if (form.$valid) {
                Auth.createUser({
                    name: $scope.user.name,
                    email: $scope.user.email,
                    password: $scope.user.password
                })
                    .then(function () {
                        // Account created, redirect to home
                        $location.path('/');
                    })
                    .catch(function (err) {
                        err = err.data;
                        $scope.errors = {};

                        // Update validity of form fields that match the mongoose errors
                        angular.forEach(err.errors, function (error, field) {
                            form[field].$setValidity('mongoose', false);
                            $scope.errors[field] = error.message;
                        });
                    });
            }
        };

        $scope.loginOauth = function (provider) {
            $window.location.href = '/auth/' + provider;
        };
    });