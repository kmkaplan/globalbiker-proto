'use strict';

angular.module('bikeTouringMapApp')
    .factory('BikelaneRepository', function ($resource) {
        return $resource('/api/bikelanes/:id/:controller', {
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
                     url: '/api/bikelanes/:id'
                }
            }
        );
    });
