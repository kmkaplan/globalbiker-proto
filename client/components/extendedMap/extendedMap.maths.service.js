 'use strict';

 angular.module('globalbikerWebApp')
     .service('extendedMapMathsService', function () {
         // AngularJS will instantiate a singleton by calling "new" on this function

         return {
             getBoundsFromGeometries: function (geometries, margin) {

                 var self = this;

                 var bounds = geometries.reduce(function (bounds, geometry) {

                     bounds = self.getBoundsFromGeometry(geometry, false, bounds);
                     return bounds;

                 }, [[null, null], [null, null]]);

                 if (margin) {
                     bounds = this._extendBounds(bounds, margin);
                 }

                 return bounds;

             },
             getBoundsFromGeometry: function (geometry, margin, initialBounds) {

                 var bounds;
                 if (initialBounds) {
                     bounds = initialBounds;
                 } else {
                     bounds = [[null, null], [null, null]];
                 }

                 var self = this;

                 if (geometry.type === 'LineString') {
                     bounds = geometry.coordinates.reduce(function (bounds, g) {

                         bounds = self._updateBoundsFromPoints(bounds, {
                             latitude: g[1],
                             longitude: g[0]
                         });
                         return bounds;

                     }, bounds);
                 } else if (geometry.type === 'MultiLineString' || geometry.type === 'Polygon') {
                     bounds = geometry.coordinates.reduce(function (bounds, coordinates) {

                         coordinates.reduce(function (bounds, g) {

                             bounds = self._updateBoundsFromPoints(bounds, {
                                 latitude: g[1],
                                 longitude: g[0]
                             });
                             return bounds;
                         }, bounds);

                         return bounds;

                     }, bounds);
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