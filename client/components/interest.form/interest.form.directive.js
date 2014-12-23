(function () {
    'use strict';

    angular.module('globalbikerWebApp')
        .directive('interestForm', function (InterestRepository) {
            return {
                templateUrl: 'components/interest.form/interest.form.html',
                restrict: 'EA',
                scope: {
                    interest: '=',
                    onSave: '&',
                    onRemove: '&'
                },
                link: {
                    pre: function preLink($scope, $element, $attrs) {

                        // scope properties


                        // scope methods
                        $scope.submitForm = submitForm;
                        $scope.remove = remove;

                        // init method
                        init();

                        function init() {

                        }


                        function remove(interest) {

                            var repository = new InterestRepository($scope.interest);

                            repository.$remove(function (interest, putResponseHeaders) {
                                // success
                                if (typeof ($scope.onRemove) === 'function') {
                                    $scope.onRemove({
                                        interest: interest
                                    });
                                }
                            }, function (err) {
                                // error
                                console.error(err);
                            });

                        }

                        function submitForm(form) {

                            if (form.$valid) {

                                // create resource
                                var repository = new InterestRepository($scope.interest);

                                if ($scope.interest._id) {
                                    repository.$update(function (interest, putResponseHeaders) {
                                        // success
                                        if (typeof ($scope.onSave) === 'function') {
                                            $scope.onSave({
                                                interest: interest,
                                                isNew: false
                                            });
                                        }
                                    }, function (err) {
                                        // error
                                        console.error(err);
                                    });
                                } else {
                                    repository.$save(function (interest, putResponseHeaders) {
                                        // success
                                        if (typeof ($scope.onSave) === 'function') {
                                            $scope.onSave({
                                                interest: interest,
                                                isNew: true
                                            });
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
            }
        });
})();