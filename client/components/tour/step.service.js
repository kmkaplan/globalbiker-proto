'use strict';

angular.module('bikeTouringMapApp')
    .factory('Step', function ($resource) {
        return $resource('/api/steps/:id/:controller', {
                id: '@_id'
            }, {
                get: {
                    method: 'GET',
                    params: {
                        id: 'me'
                    }
                },
                update: {
                    method: 'PUT'
                },
                getByTour: {
                    method: 'GET',
                    isArray: true,
                    url: '/api/steps/tour/:tourId'
                }
            }
        );
    });