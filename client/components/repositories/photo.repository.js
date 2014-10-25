'use strict';

angular.module('globalbikerWebApp')
    .factory('PhotoRepository', function ($resource) {
        return $resource('/api/photos/:id/:controller', {
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
                url: '/api/photos/:id'
            },
            searchAroundTour: {
                method: 'GET',
                url: '/api/photos/search/tour',
                params: {
                    tourId: '@tourId',
                    distance: '@distance'
                },
                isArray: true
            }
        });
    });