'use strict';

angular.module('globalbikerWebApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('tour.step', {
                url: '/step/:stepId',
                abstract: true,
                template: '<ui-view/>',
                resolve: {
                    step: function (tour, $stateParams, $q, stepLoaderService, PhotoRepository) {

                        var deffered = $q.defer();

                        if ($stateParams.stepId) {

                            stepLoaderService.loadStep($stateParams.stepId, {
                                tour: {},
                                step: {
                                    interestsAround: {
                                        distance: [
                                            // large distance types
                                            10000, 10000, 10000,
                                            // medium distance types
                                            2000, 2000, 2000, 2000,
                                            // low distance types
                                            200, 200, 200, 200],
                                        type: [ // large distance types
                                            'interest', 'hobbies', 'accomodation',
                                            // medium distance types
                                            'information', 'water-point', 'bike-shops', 'food',
                                            // low distance types
                                            'danger', 'water-point', 'wc', 'velotoulouse']
                                    },
                                    photosAround: {}
                                }
                            }).then(function (step) {
                                console.info('Step %s loaded successfully.', step._id);
                                deffered.resolve(step);

                                if (step.photoId) {
                                    PhotoRepository.get({
                                        id: step.photoId
                                    }, function (photo) {
                                        step.photo = photo;
                                    }, function (err) {
                                        console.error(err);
                                    });

                                }

                            }, function (err) {
                                console.error(err);
                                deffered.resolve(null);
                            });

                        } else {
                            console.error('Step id is not defined.');
                            deffered.resolve(null);
                        }

                        return deffered.promise;
                    }
                }
            });
    });