'use strict';

angular.module('bikeTouringMapApp')
    .factory('InterestRepository', function ($resource) {
        return $resource('/api/interests/:id/:controller', {
            id: '@_id'
        }, {
            searchAroundPoint: {
                method: 'GET',
                url: '/api/interests/search/point',
                params: {
                    latitude: '@latitude',
                    longitude: '@longitude',
                    maxDistance: '@maxDistance',
                    priority: '@priority'
                },
                isArray: true
            },
            searchAroundTour: {
                method: 'GET',
                url: '/api/interests/search/tour',
                params: {
                    tourId: '@tourId',
                    type: '@type',
                    distance: '@distance'
                },
                isArray: true
            },
            searchAroundStep: {
                method: 'GET',
                url: '/api/interests/search/step',
                params: {
                    tourId: '@stepId',
                    type: '@type',
                    distance: '@distance'
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
            getByTour: {
                method: 'GET',
                isArray: true,
                url: '/api/interests/tour/:tourId'
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