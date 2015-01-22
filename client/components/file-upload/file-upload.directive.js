(function () {
    'use strict';

    angular.module('globalbikerWebApp').directive('fileUpload', fileUpload);

    function fileUpload($upload) {
        return {
            templateUrl: 'components/file-upload/file-upload.html',
            transclude: true,
            restrict: 'EA',
            scope: {
                fileUpload: '='
            },
            link: {
                pre: function preLink($scope, $element, $attrs) {

                    $scope.onFileSelect = function ($files) {

                        if ($scope.fileUpload && $scope.fileUpload.callbacks && $scope.fileUpload.callbacks.filesSelected && typeof ($scope.fileUpload.callbacks.filesSelected) === 'function') {
                            $scope.fileUpload.callbacks.filesSelected($files);
                        }

                        if ($scope.fileUpload && $scope.fileUpload.autoUpload) {
                            upload($files);
                        }
                    };

                    $scope.init = function () {
                        $scope.fileUploadProgress = null;
                    };


                    return $scope.init();

                    function upload($files) {
                        //$files: an array of files selected, each file has name, size, and type.
                        for (var i = 0; i < $files.length; i++) {

                            var file = $files[i];

                            $scope.fileUploadProgress = 0;

                            var data = {};
                            if ($scope.fileUpload.data && typeof ($scope.fileUpload.data) === 'function') {
                                data = $scope.fileUpload.data();
                            }

                            var url = "";
                            if ($scope.fileUpload.url) {
                                if (typeof ($scope.fileUpload.data) === 'function') {
                                    url = $scope.fileUpload.url();
                                } else {
                                    url = $scope.fileUpload.url;
                                }
                            }

                            $scope.upload = $upload.upload({
                                url: url,
                                file: file,
                                data: data
                            }).progress(function (evt) {
                                $scope.fileUploadProgress = (100 * evt.loaded / evt.total);
                            }).success(function (data, status, headers, config) {

                                if ($scope.fileUpload && $scope.fileUpload.callbacks && $scope.fileUpload.callbacks.success && typeof ($scope.fileUpload.callbacks.success) === 'function') {
                                    $scope.fileUpload.callbacks.success(data);
                                }
                                $scope.fileUploadProgress = null;
                            }).error(function (msg) {
                                console.error(msg);
                                $scope.fileUploadProgress = null;
                            });

                        }
                    }
                }
            }
        };

    }
})();