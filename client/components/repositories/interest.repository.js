'use strict';

angular.module('bikeTouringMapApp')
    .factory('InterestRepository', function ($resource) {
        return $resource('/api/interests/:id/:controller', {
            id: '@_id'
        }, {
            search: {
                method: 'GET',
                url: '/api/interests/search',
                params: {
                    latitude: '@latitude',
                    longitude: '@longitude',
                    maxDistance: '@maxDistance',
                    priority: '@priority'
                },
                isArray: true
            },
            get: {
                method: 'GET',
                params: {
                    id: 'me'
                }
            },
            update: {
                method: 'PUT',
                url: '/api/interests/:id'
            },
            getByStep: {
                method: 'GET',
                isArray: true,
                url: '/api/interests/step/:stepId'
            },
            deletePhoto: {
                method: 'DELETE',
                url: '/api/interests/:id/photo',
                params: {
                    photoId: '@photoId'
                }
            }
        });
    });