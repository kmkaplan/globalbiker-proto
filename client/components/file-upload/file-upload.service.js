(function () {
    'use strict';

    angular.module('globalbikerWebApp').factory('fileUploadService', fileUploadService);

    function fileUploadService($q, $log, Upload) {

        var service = {};

        service.uploadFile = uploadFile;

        service.uploadFiles = uploadFiles;

        return service;

        function uploadFile(file, url, data) {

            var deffered = $q.defer();

            Upload.upload({
                url: url,
                fields: data,
                file: file
            }).progress(function (evt) {
                deffered.notify(evt);
            }).success(function (data, status, headers, config) {
                deffered.resolve(data);
            }).error(function (data, status, headers, config) {
                deffered.reject(new Error('Error status: ' + status));
            });

            return deffered.promise;
        }

        function uploadFiles(files, url, data) {

            var deffered = $q.defer();

            var progress = {
                totalFiles: files.length,
                currentFileIndex: 0,
                currentFileProgress: 0
            };

            uploadFileRecursive(files, url, data, progress, deffered, []);

            return deffered.promise;
        }
        
        function uploadFileRecursive(files, url, data, progress, deffered, responses){
            
            if (progress.currentFileIndex < progress.totalFiles) {

                var file = files[progress.currentFileIndex];
                
                progress.currentFileProgress = 0;
                deffered.notify(progress);

                uploadFile(file, url, data).then(function (response) {
                    // success
                    $log.log('File ' + file.name + 'uploaded. Response: ' + response);

                    responses.push(response);
                    progress.currentFileIndex++;
                    
                    // process next file
                    uploadFileRecursive(files, url, data, progress, deffered, responses);
                    
                }, function (err) {
                    // error
                    deffered.reject(err);
                }, function (evt) {
                    // progress
                    progress.currentFileProgress = (100 * evt.loaded / evt.total);
                    deffered.notify(progress);
                });

                return true;
            }else{
                // no more files: success
                deffered.resolve(responses);
            }
        }
    }

})();