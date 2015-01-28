'use strict';

angular.module('globalbikerWebApp')
    .factory('CountryRepository', function ($resource) {
        return $resource('/api/countries/:id/:controller', {
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
                url: '/api/countries/:id'
            }
        });
    });