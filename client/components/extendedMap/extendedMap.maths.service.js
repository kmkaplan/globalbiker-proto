 'use strict';

 angular.module('bikeTouringMapApp')
     .service('extendedMapMathsService', function () {
         // AngularJS will instantiate a singleton by calling "new" on this function

         return {
             getBoundsFromGeometry: function (geometry, margin) {
                 var self = this;
                 var bounds;
                 if (geometry.type === 'LineString') {
                     bounds = geometry.coordinates.reduce(function (bounds, g) {

                         bounds = self._updateBoundsFromPoints(bounds, {
                             latitude: g[1],
                             longitude: g[0]
                         });
                         return bounds;

                     }, [[null, null], [null, null]]);
                 } else if (geometry.type === 'MultiLineString') {
                     bounds = geometry.coordinates.reduce(function (bounds, coordinates) {

                         coordinates.reduce(function (bounds, g) {

                             bounds = self._updateBoundsFromPoints(bounds, {
                                 latitude: g[1],
                                 longitude: g[0]
                             });
                             return bounds;
                         }, bounds);

                         return bounds;

                     }, [[null, null], [null, null]]);
                 } else {
                     console.error('Geometry type "%s" not supported.', geometry.type);
                     return null;
                 }
                 if (margin) {
                     bounds = this._extendBounds(bounds, margin);
                 }
                 return bounds;
             },

             _updateBoundsFromPoints: function (bounds, p) {
                 if (bounds[0][0] === null || bounds[0][0] > p.latitude) {
                     bounds[0][0] = p.latitude;
                 }

                 if (bounds[1][0] === null || bounds[1][0] < p.latitude) {
                     bounds[1][0] = p.latitude;
                 }

                 if (bounds[0][1] === null || bounds[0][1] > p.longitude) {
                     bounds[0][1] = p.longitude;
                 }

                 if (bounds[1][1] === null || bounds[1][1] < p.longitude) {
                     bounds[1][1] = p.longitude;
                 }

                 return bounds;
             },


             getBoundsFromPoints: function (points, margin) {
                 var self = this;

                 if (points) {
                     var bounds = [[null, null], [null, null]];

                     points.reduce(function (output, p) {

                         if (!p.latitude) {
                             console.warn('Invalid point latitude.');
                         }

                         if (!p.longitude) {
                             console.warn('Invalid point longitude.');
                         }

                         bounds = self._updateBoundsFromPoints(bounds, p);

                         return output;
                     }, []);

                     if (margin) {
                         bounds = this._extendBounds(bounds, margin);
                     }
                     return bounds;
                 }
                 return null;
             },
             _extendBounds: function (bounds, margin) {
                 if (margin) {
                     var latitudeMargin = (bounds[1][0] - bounds[0][0]) * margin;
                     bounds[0][0] -= latitudeMargin;
                     bounds[1][0] += latitudeMargin

                     var longitudeMargin = (bounds[1][1] - bounds[0][1]) * margin;
                     bounds[0][1] -= longitudeMargin;
                     bounds[1][1] += longitudeMargin
                 }

                 return bounds;
             }
         };
     });