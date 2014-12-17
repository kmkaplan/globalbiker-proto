'use strict';

angular.module('globalbikerWebApp')
    .service('mapCreationService', function (extendedMapMathsService) {
        // AngularJS will instantiate a singleton by calling "new" on this function

        return {

            create: function (element, config) {

                var map = L.map(element, {});

                L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg', {}).addTo(map);

                return map;
            },
            fitBounds: function (map, bounds) {
                if (bounds && bounds.geometry) {


                    if (L.Util.isArray(bounds.geometry)) {

                        console.log('Fit bounds to %d geometries.', bounds.geometry.length);

                        var bounds = extendedMapMathsService.getBoundsFromGeometries(bounds.geometry, 0.1);
                        map.fitBounds(bounds);
                        // FIXME does not work :
                        map.setMaxBounds(bounds);
                    } else {

                        console.log('Fit bounds to geometry: ', bounds.geometry);

                        var bounds = extendedMapMathsService.getBoundsFromGeometry(bounds.geometry, 0.1);
                        map.fitBounds(bounds);
                        // FIXME does not work :
                        map.setMaxBounds(bounds);
                    }
                }
            },
            enableDrawing: function (map, drawingOptions) {
                
                var defaultDrawOptions = {
                    polyline: true,
                    marker: false,
                    circle: false,
                    rectangle: false,
                    polygon: false
                };

                var drawControl = new L.Control.Draw({
                   /* edit: {
                        featureGroup: drawLayer
                    },*/
                    draw: $.extend({}, defaultDrawOptions, drawingOptions)
                });
                map.addControl(drawControl);
                
            }
        }

    });