'use strict';

angular.module('globalbikerWebApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('tour', {
                abstract: true,
                url: '/tour/:id',
                templateUrl: 'app/tour/tour.html',
                controller: 'TourCtrl',
                resolve: {
                    tour: function ($stateParams, $q, tourLoaderService, PhotoRepository) {

                        var deffered = $q.defer();

                        if ($stateParams.id) {

                            tourLoaderService.loadTour($stateParams.id, {
                                steps: {},
                                interestsAround: {
                                    distance: 10000,
                                    type: ['interest', 'hobbies']
                                }
                            }).then(function (tour) {
                                console.info('Tour "%s" loaded successfully.', tour.title);
                                deffered.resolve(tour);
                                
                                if (tour.photoId) {
                                    PhotoRepository.get({
                                        id: tour.photoId
                                    }, function (photo) {
                                        tour.photo = photo;
                                    }, function (err) {
                                        console.error(err);
                                    });

                                }
                                
                            }, function (err) {
                                console.error('Error while loading tour %s.', $stateParams.id, err);
                                deffered.resolve(null);
                            });

                        } else {
                            console.error('Tour id is not defined.');
                            deffered.resolve(null);
                        }

                        return deffered.promise;
                    }
                }
            });
    });