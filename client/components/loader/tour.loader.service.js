'use strict';

angular.module('globalbikerWebApp')
    .service('tourLoaderService', function ($q, TourRepository, PhotoRepository, StepRepository, photoLoaderService) {
        // AngularJS will instantiate a singleton by calling "new" on this function

        return {

            getTour: function (tourId, options) {
                var deffered = $q.defer();

                TourRepository.get({
                        id: tourId
                    }, function (tour) {
                        deffered.resolve(tour);
                    },
                    function (err) {
                        console.error(err);
                        deffered.reject(err);
                    });

                return deffered.promise;
            },

            getPhotosAroundTour: function (tour, options) {
                var deffered = $q.defer();

                if (options.tour && options.tour.photosAround) {

                    if (!options.tour.photosAround.distance) {
                        options.tour.photosAround.distance = 200;
                    }

                    PhotoRepository.searchAroundTour({
                            tourId: tour._id,
                            distance: options.tour.photosAround.distance
                        }, function (photos) {
                            tour.photos = photos;
                            deffered.resolve(tour);
                        },
                        function (err) {
                            deffered.reject(err);
                        });

                } else {
                    deffered.resolve(tour);
                }

                return deffered.promise;
            },

            getTourPhoto: function (tour, options) {
                var deffered = $q.defer();

                if (tour.photoId && options.tour && options.tour.photo) {
                    photoLoaderService.getPhoto(tour.photoId).then(function (photo) {
                        tour.photo = photo;
                        deffered.resolve(tour);
                    }, function (err) {
                        deffered.reject(err);
                    });
                } else {
                    deffered.resolve(tour);
                }

                return deffered.promise;
            },
            getSteps: function (tour, options) {

                var deffered = $q.defer();

                if (options.steps) {

                    StepRepository.getByTour({
                        tourId: tour._id
                    }, function (steps) {

                        tour.steps = steps;

                        deffered.resolve(tour);

                    }, function (err) {
                        // error loading tour
                        deffered.reject(err);
                    });
                } else {
                    deffered.resolve(tour);
                }

                return deffered.promise;

            },
            loadDetails: function (tour, options) {
                var self = this;

                var deffered = $q.defer();

                this.getTourPhoto(tour, options).then(function (tour) {

                    self.getPhotosAroundTour(tour, options).then(function (tour) {

                        self.getSteps(tour, options).then(function (tour) {
                            deffered.resolve(tour);

                        }, function (err) {
                            console.error(err);
                            deffered.reject(err);
                        });

                    }, function (err) {
                        console.error(err);
                        deffered.reject(err);
                    });

                }, function (err) {
                    console.error(err);
                    deffered.reject(err);
                });

                return deffered.promise;
            },

            loadTour: function (tourId, options) {
                var self = this;

                var deffered = $q.defer();

                this.getTour(tourId).then(function (tour) {
                        deffered.resolve(self.loadDetails(tour, options));
                    },
                    function (err) {
                        console.error(err);
                        deffered.reject(err);
                    });

                return deffered.promise;
            }
        };
    });