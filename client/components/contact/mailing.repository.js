'use strict';

angular.module('bikeTouringMapApp')
    .factory('MailingRepository', function ($resource) {
        return $resource('/api/mailing/:id/:controller', {
                mail: '@_email'
            }, {
                addMail: {
                    method: 'POST',
                    url: '/api/mailing/',
                    params: {
                        email: 'blabla@gmail.com'
                    }
                }
            }
        );
    });
