(function () {
    'use strict';

    angular.module('globalbikerWebApp')
        .directive('interestForm', function (InterestRepository, interestLoaderService) {
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
                        $scope.photosupload;

                        // scope methods
                        $scope.submitForm = submitForm;
                        $scope.remove = remove;

                        // init method
                        init();

                        function init() {

                            interestLoaderService.loadDetails($scope.interest, {
                                interest: {
                                    photos: true
                                }
                            }).then(function (interest) {
                                $scope.interest = interest;
                            });

                            $scope.photosupload = {
                                // TODO manage multiple photos
                                multiple: false,
                                url: function () {
                                    return '/api/photos/upload';
                                },
                                data: function () {
                                    return {
                                        geometry: $scope.interest.geometry
                                    }
                                },
                                callbacks: {
                                    success: function (photo) {
                                        $scope.interest.photos.push(photo);
                                        $scope.interest.photosIds.push(photo._id);
                                    }
                                }
                            };
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