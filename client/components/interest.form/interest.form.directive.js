(function () {
    'use strict';

    angular.module('globalbikerWebApp')
        .directive('interestForm', function (InterestRepository, interestLoaderService, LicenseRepository, PhotoRepository) {
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
                        $scope.licenses = LicenseRepository.query();

                        // scope methods
                        $scope.submitForm = submitForm;
                        $scope.remove = remove;
                        $scope.selectPhoto = selectPhoto;
                        $scope.getLicense = getLicense;
                        $scope.updatePhoto = updatePhoto;
                        $scope.removePhoto = removePhoto;

                        // init method
                        init();

                        function init() {

                            if ($scope.interest._id) {

                                interestLoaderService.loadDetails($scope.interest, {
                                    interest: {
                                        photos: true
                                    }
                                }).then(function (interest) {
                                    $scope.interest = interest;
                                });

                            } else {
                                $scope.interest.photos = [];
                                $scope.interest.photosIds = [];
                            }

                            $scope.photosupload = {
                                // TODO manage multiple photos
                                multiple: false,
                                autoUpload: true,
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
                                        if (! $scope.interest.photosIds){
                                            $scope.interest.photosIds = [];
                                        }
                                        $scope.interest.photos.push(photo);
                                        $scope.interest.photosIds.push(photo._id);
                                        $scope.photo = new PhotoRepository(photo);
                                    }
                                }
                            };
                        }

                        function updatePhoto(photo) {
                            if (photo && photo._id) {

                                photo.$update(function (data, putResponseHeaders) {
                                    console.info('Photo updated.');
                                });
                            }
                            $scope.photo = null;
                        };

                        function removePhoto(interest, photo) {
                            if (interest && photo && photo._id) {

                                var index = interest.photos.indexOf(photo);
                                if (index > -1) {
                                    interest.photos.splice(index, 1);
                                }

                                index = interest.photosIds.indexOf(photo._id);
                                if (index > -1) {
                                    interest.photosIds.splice(index, 1);
                                }
                            }
                            
                             $scope.photo = null;
                        };

                        function getLicense(photo) {
                            if (!photo || !photo.licenseId) {
                                return null;
                            }
                            var license = $scope.licenses.reduce(function (photoLicense, license) {
                                    if (license._id === photo.licenseId) {
                                        return license;
                                    }
                                    return photoLicense;
                                },
                                null);
                            return license;
                        }

                        function selectPhoto(photo) {
                            $scope.photo = photo;
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