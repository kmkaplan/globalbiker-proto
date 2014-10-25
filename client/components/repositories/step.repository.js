'use strict';

angular.module('globalbikerWebApp')
    .factory('StepRepository', function ($resource) {
        return $resource('/api/steps/:id/:controller', {
                id: '@_id'
            }, {
                get: {
                    method: 'GET',
                    params: {
                        id: 'me'
                    }
                },
                update: {
                    method: 'PUT',
                     url: '/api/steps/:id'
                },
                getByTour: {
                    method: 'GET',
                    isArray: true,
                    url: '/api/steps/tour/:tourId'
                }
            }
        );
    });
