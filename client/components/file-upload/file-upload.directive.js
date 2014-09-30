'use strict';


angular.module('bikeTouringMapApp')
    .directive('fileUpload', function ($upload) {
        return {
            templateUrl: 'components/file-upload/file-upload.html',
            restrict: 'EA',
            scope: {
                fileUpload: '='
            },
            link: {
                pre: function preLink($scope, $element, $attrs) {

                    $scope.onFileSelect = function ($files) {
                        //$files: an array of files selected, each file has name, size, and type.
                        for (var i = 0; i < $files.length; i++) {
                            var file = $files[i];

                            $scope.fileUploadProgress = 0;

                            $scope.upload = $upload.upload({
                                url: $scope.fileUpload.url,
                                file: file,
                            }).progress(function (evt) {
                                $scope.fileUploadProgress = (100 * evt.loaded / evt.total);
                            }).success(function (data, status, headers, config) {
                                if ($scope.fileUpload && $scope.fileUpload.callbacks && $scope.fileUpload.callbacks.success && typeof($scope.fileUpload.callbacks.success) === 'function'){
                                    $scope.fileUpload.callbacks.success(data);
                                }
                                $scope.fileUploadProgress = null;
                            }).error(function (msg) {
                                console.error(msg);
                                $scope.fileUploadProgress = null;
                            });

                        }
                    };

                    $scope.init = function () {

                        $scope.fileUploadProgress = null;

                    };


                    return $scope.init();
                }
            }
        };
    });