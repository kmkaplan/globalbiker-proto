'use strict';

angular.module('globalbikerWebApp')
    .service('interestLoaderService', function ($q, InterestRepository, PhotoRepository, photoLoaderService) {
        // AngularJS will instantiate a singleton by calling "new" on this function

        return {

            getPhotos: function (interest, options) {

                var deffered = $q.defer();

                if (options.interest.photos && interest.photosIds && interest.photosIds.length > 0) {

                    var defferedArray = interest.photosIds.reduce(function (defferedArray, photoId) {
                        defferedArray.push(photoLoaderService.getPhoto(photoId));
                        return defferedArray;
                    }, []);

                    deffered.resolve($q.all(defferedArray));

                } else {
                    deffered.resolve([]);
                }

                return deffered.promise;
            },
            loadDetails: function (interest, options) {
                var self = this;

                var deffered = $q.defer();

                self.getPhotos(interest, options).then(function (photos) {
                    interest.photos = photos;
                    deffered.resolve(interest);

                }, function (err) {
                    console.error(err);
                    deffered.reject(err);
                });

                return deffered.promise;
            }
        };
    });