'use strict';

angular.module('bikeTouringMapApp')
    .factory('TourRepository', function ($resource) {
        return $resource('/api/tours/:id/:controller', {
            id: '@_id'
        }, {
            get: {
                method: 'GET',
                params: {
                    id: 'me'
                }
            },
            getMines: {
                method: 'GET',
                isArray: true,
                url: '/api/tours/mines'
            }
        });
    });
