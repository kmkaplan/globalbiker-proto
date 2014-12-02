'use strict';

angular.module('globalbikerWebApp')
    .factory('RegionRepository', function ($resource) {
        return $resource('/api/regions/:id/:controller', {
            id: '@_id'
        }, {
            findByReference: {
                method: 'GET',
                url: '/api/regions/reference/:reference'
            },
            update: {
                method: 'PUT',
                url: '/api/regions/:id'
            }
        });
    });