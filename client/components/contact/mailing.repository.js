'use strict';

angular.module('bikeTouringMapApp')
    .factory('MailingRepository', function ($resource) {
        return $resource('/api/mailings/:id/:controller', {
                id: '@_id'
            }, {
                get: {
                    method: 'GET',
                    params: {
                        id: 'me'
                    }
                }
            }
        );
    });
