'use strict';

angular.module('bikeTouringMapApp')
    .factory('SteppointRepository', function ($resource) {
        return $resource('/api/steppoints/:id/:controller', {
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
                url: '/api/steppoints/:id'
            },
            getByStep: {
                method: 'GET',
                isArray: true,
                url: '/api/steppoints/step/:stepId'
            },
            deleteByStep: {
                method: 'DELETE',
                url: '/api/steppoints/step/:stepId'
            },
            updateByStep: {
                method: 'PUT',
                url: '/api/steppoints/step/:stepId',
                params: {
                    stepId: '@stepId'
                }
            }

        });
    });
