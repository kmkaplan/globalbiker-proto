(function () {

    'use strict';

    angular.module('globalbikerWebApp').factory('mapCreationService', mapCreationService);

    function mapCreationService(extendedMapMathsService) {

        var service = {
            create: create,
            fitBounds: fitBounds,
            configureDrawTools: configureDrawTools
        };

        return service;

        function create(element, config) {
            
            if (!config.scrollWheelZoom){
                config.scrollWheelZoom = false;
            }

            var map = L.map(element, {
                scrollWheelZoom: config.scrollWheelZoom
            });

            var url;
            if (config.url) {
                url = config.url;
            } else {
                url = 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg';
            }

            L.tileLayer(url, {}).addTo(map);

            return map;
        }

        function fitBounds(map, bounds) {
            if (bounds && bounds.geometry) {


                if (L.Util.isArray(bounds.geometry)) {

                    console.log('Fit bounds to %d geometries.', bounds.geometry.length);

                    var bounds = extendedMapMathsService.getBoundsFromGeometries(bounds.geometry, 0.1);
                    if (bounds !== null){
                        map.fitBounds(bounds);
                    }
                } else {

                    console.log('Fit bounds to geometry: ', bounds.geometry);

                    var bounds = extendedMapMathsService.getBoundsFromGeometry(bounds.geometry, 0.1);
                    map.fitBounds(bounds);
                }
            }
        }

        function configureDrawTools(map, drawingTools, config) {

            var defaultDrawingOptions = {
                polyline: false,
                marker: false,
                circle: false,
                rectangle: false,
                polygon: false
            }
            var callbacks = {
                created: {}
            };
            var drawingOptions = drawingTools ? drawingTools.reduce(function (drawingOptions, tool) {
                switch (tool.type) {
                case 'polyline':
                case 'marker':
                case 'circle':
                case 'rectangle':
                case 'polygon':
                    drawingOptions[tool.type] = true;
                    if (typeof (tool.created) === 'function') {
                        // register callback
                        callbacks.created[tool.type] = tool.created;
                    }
                    break;
                default:
                    console.error('Invalid tool type "%s".', tool.type);
                    break;
                }
                return drawingOptions;
            }, defaultDrawingOptions) : defaultDrawingOptions;

            if (typeof (map.drawControl) !== 'undefined') {
                // remove previous control
                map.removeControl(map.drawControl);
                // clear events
                map.clearAllEventListeners();
            }
            // create new control
            map.drawControl = new L.Control.Draw({
                /* edit: {
                        featureGroup: drawLayer
                    },*/
                draw: drawingOptions
            });
            map.addControl(map.drawControl);

            registerDrawListeners(map, config, callbacks);
        }

        function registerDrawListeners(map, config, callbacks) {

            map.on('draw:created', function (e) {

                var type = e.layerType;
                var layer = e.layer;

                var callback = callbacks.created[type];

                if (callback) {


                    var geojson = layer.toGeoJSON();

                    callback(map, config, geojson, e);

                }

            });
        }

        function getPointsFromLayer(layer) {
            var points = layer.getLatLngs().reduce(function (output, item) {
                output.push({
                    latitude: item.lat,
                    longitude: item.lng
                });
                return output;
            }, []);

            return points;
        }

    }

})();