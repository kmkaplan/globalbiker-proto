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
                    tour: function ($stateParams, $q, tourLoaderService) {

                        var deffered = $q.defer();

                        if ($stateParams.id) {

                            tourLoaderService.loadTour($stateParams.id, {
                                steps: {}
                            }).then(function (tour) {
                                console.info('Tour "%s" loaded successfully.', tour.title);
                                deffered.resolve(tour);
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