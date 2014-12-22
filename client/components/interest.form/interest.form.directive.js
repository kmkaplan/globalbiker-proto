(function () {
    'use strict';

    angular.module('globalbikerWebApp')
        .directive('interestForm', function (InterestRepository) {
            return {
                templateUrl: 'components/interest.form/interest.form.html',
                restrict: 'EA',
                scope: {
                    interest: '=',
                    onSave: '&'
                },
                link: {
                    pre: function preLink($scope, $element, $attrs) {

                        // scope properties


                        // scope methods
                        $scope.submitForm = submitForm;

                        // init method
                        init();

                        function init() {

                        }

                        function submitForm(form) {

                            if (form.$valid) {

                                // create resource
                                new InterestRepository($scope.interest).$save(function (interest, putResponseHeaders) {
                                    // success
                                    if (typeof ($scope.onSave) === 'function') {
                                        $scope.onSave(interest);
                                    }
                                }, function (err) {
                                    // error
                                    console.error(err);
                                });
                            }

                        }
                    }

                }
            }
        });
})();