'use strict';

angular.module('globalbikerWebApp')
    .service('photoLoaderService', function ($q, PhotoRepository) {
        // AngularJS will instantiate a singleton by calling "new" on this function

        return {

            getPhoto: function (photoId) {
                var deffered = $q.defer();

                PhotoRepository.get({
                    id: photoId
                }, function (photo) {
                    deffered.resolve(photo);
                }, function (err) {
                    console.error(err);
                    deffered.reject(err);
                });

                return deffered.promise;
            }
        };
    });