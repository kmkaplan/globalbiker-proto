'use strict';

angular.module('globalbikerWebApp')
    .factory('TourRepository', function ($resource) {
        return $resource('/api/tours/:id/:controller', {
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
                    reference: '@reference'
                },
                url: '/api/tours/reference/:reference'
            },
            update: {
                method: 'PUT',
                url: '/api/tours/:id'
            },
            getMines: {
                method: 'GET',
                isArray: true,
                url: '/api/tours/mines'
            }
        });
    });