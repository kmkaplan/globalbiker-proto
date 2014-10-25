'use strict';

angular.module('globalbikerWebApp')
    .factory('LicenseRepository', function ($resource) {
        return $resource('/api/licenses/:id/:controller', {
            id: '@_id'
        });
    });