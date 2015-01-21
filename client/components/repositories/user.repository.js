'use strict';

angular.module('globalbikerWebApp')
    .factory('UserRepository', function ($resource) {
        return $resource('/api/users/:id/:controller', {
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
                url: '/api/users/:id'
            }
        });
    });