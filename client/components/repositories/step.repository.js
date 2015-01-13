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
            getByReference: {
                method: 'GET',
                params: {
                    tourId: '@tourId',
                    reference: '@reference'
                },
                url: '/api/steps/tour/:tourId/reference/:reference'
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
        });
    });