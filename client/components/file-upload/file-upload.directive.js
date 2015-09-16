(function () {
    'use strict';

    angular.module('globalbikerWebApp').directive('fileUpload', fileUpload);

    function fileUpload($log, fileUploadService) {
        return {
            templateUrl: 'components/file-upload/file-upload.html',
            transclude: true,
            restrict: 'EA',
            scope: {
                fileUpload: '='
            },
            link: {
                pre: function preLink($scope, $element, $attrs) {

                    $scope.progress = {};

                    $scope.onFileSelect = function ($files) {

                        console.log('test');

                        if ($scope.fileUpload && $scope.fileUpload.callbacks && $scope.fileUpload.callbacks.filesSelected && typeof ($scope.fileUpload.callbacks.filesSelected) === 'function') {
                            $scope.fileUpload.callbacks.filesSelected($files);
                        }

                        if ($scope.fileUpload && $scope.fileUpload.autoUpload) {
                            upload($files);
                        }
                    };

                    $scope.init = function () {};


                    return $scope.init();

                    function upload($files) {

                        var data = {};
                        if ($scope.fileUpload.data && typeof ($scope.fileUpload.data) === 'function') {
                            data = $scope.fileUpload.data();
                        }

                        var url = "";
                        if ($scope.fileUpload.url) {
                            if (typeof ($scope.fileUpload.url) === 'function') {
                                url = $scope.fileUpload.url();
                            } else {
                                url = $scope.fileUpload.url;
                            }
                        }

                        fileUploadService.uploadFiles($files, url, data).then(function (data) {
                            // success
                            if ($scope.fileUpload && $scope.fileUpload.callbacks && $scope.fileUpload.callbacks.success && typeof ($scope.fileUpload.callbacks.success) === 'function') {
                                $scope.fileUpload.callbacks.success(data);
                            }
                            $scope.progress = {};
                        }, function (err) {
                            // error
                            $log.error('Error: ', err);
                            $scope.progress = {};
                        }, function (progress) {
                            // progress
                            $scope.progress = progress;
                        });

                    }
                }
            }
        };

    }
})();