'use strict';

angular.module('bikeTouringMapApp')
    .service('extendedMapDrawService', function (extendedMapCoreService) {
        // AngularJS will instantiate a singleton by calling "new" on this function

        return {
            
            enableDrawing: function (eMap) {

                var map = eMap.map;

                var thisService = this;

                var drawLayer = new L.FeatureGroup();
                map.addLayer(drawLayer);

                eMap.eLayersMap['draw'] = {
                    layer: drawLayer,
                    itemsMap: {}
                };

                var defaultDrawOptions = {
                    polyline: false,
                    marker: false,
                    circle: false,
                    rectangle: false,
                    polygon: false
                };

                var drawControl = new L.Control.Draw({
                    edit: {
                        featureGroup: drawLayer
                    },
                    draw: $.extend({}, defaultDrawOptions, eMap.config.drawingOptions)
                });
                map.addControl(drawControl);

                map.on('draw:created', function (e) {
                    var type = e.layerType;
                    var layer = e.layer;

                    // TODO remove (or make it an option)
                    // drawLayer.addLayer(layer);
                    layer.addTo(map);

                    if (typeof (callbacks) !== 'undefined' && typeof (callbacks['draw:created']) === 'function') {
                        var points = thisService.getPointsFromLayer(layer);

                        callbacks['draw:created'](eMap, points, e);
                    }

                });

                map.on('draw:edited', function (e) {
                    var layers = e.layers;

                    layers.eachLayer(function (layer) {
                        if (typeof (callbacks) !== 'undefined' && typeof (callbacks['draw:edited']) === 'function') {
                            var points = thisService.getPointsFromLayer(layer);

                            callbacks['draw:edited'](eMap, points, e);
                        }
                    });
                });

                map.on('draw:deleted', function (e) {
                    if (typeof (callbacks) !== 'undefined' && typeof (callbacks['draw:deleted']) === 'function') {
                        var points = thisService.getPointsFromLayer(e.layer);

                        callbacks['draw:deleted'](eMap, points, e);
                    }
                });

            },

           getPointsFromLayer: function (layer) {
                var points = layer.getLatLngs().reduce(function (output, item) {
                    output.push({
                        latitude: item.lat,
                        longitude: item.lng
                    });
                    return output;
                }, []);

                return points;
            },

            
        }

    });