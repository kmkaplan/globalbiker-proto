'use strict';

angular.module('globalbikerWebApp')
    .factory('MessageRepository', function ($resource) {
        return $resource('/api/messages/:id/:controller', {
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
                url: '/api/messages/:id'
            }
        });
    });