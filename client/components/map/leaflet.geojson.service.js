(function () {

    'use strict';

    angular.module('globalbikerWebApp').factory('leafletGeojsonService', leafletGeojsonService);

    function leafletGeojsonService() {

        var service = {
            pointToGeoJSON: pointToGeoJSON
        };

        return service;

        function pointToGeoJSON(point) {

            var latlng = point.getLatLng();

            var coordinates = [latlng.lng, latlng.lat];

            if (latlng.alt !== undefined) {
                coordinates.push(latlng.alt);
            }

            return {
                type: 'Point',
                coordinates: coordinates
            };
        }
    }
})();