'use strict';

angular.module('bikeTouringMapApp')
    .factory('LicenseRepository', function ($resource) {
        return $resource('/api/licenses/:id/:controller', {
            id: '@_id'
        });
    });