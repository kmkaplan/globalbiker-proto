'use strict';

angular.module('bikeTouringMapApp')
    .factory('BikelaneRepository', function ($resource) {
        return $resource('/api/bikelanes/:id/:controller', {
            id: '@_id'
        }, {
            search: {
                method: 'GET',
                url: '/api/bikelanes/search',
                params: {
                    latitude: '@latitude',
                    longitude: '@longitude',
                    maxDistance: '@maxDistance'
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
                url: '/api/bikelanes/:id'
            }
        });
    });