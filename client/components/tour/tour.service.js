'use strict';

angular.module('bikeTouringMapApp')
    .factory('Tour', function ($resource) {
        return $resource('/api/tours/:id/:controller', {
            id: '@_id'
        }, {
            get: {
                method: 'GET',
                params: {
                    id: 'me'
                }
            }
        });
    });