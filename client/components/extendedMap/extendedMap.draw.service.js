'use strict';

angular.module('bikeTouringMapApp')
    .service('extendedMapDrawService', function (extendedMapCoreService) {
        // AngularJS will instantiate a singleton by calling "new" on this function

        return {

            enableDrawing: function (eMap) {

                var map = eMap.map;

                var thisService = this;

                var drawLayer = new L.FeatureGroup();

                drawLayer.layerOptions = {
                    name: 'draw'
                };

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

                    if (typeof (eMap.config.callbacks) !== 'undefined' && typeof (eMap.config.callbacks['draw:created']) === 'function') {

                        if (type === 'marker') {
                            var point = thisService.getSinglePointFromLayer(layer);

                            eMap.config.callbacks['draw:created'](eMap, point, e);
                        } else if (type === 'polyline') {
                            var points = thisService.getPointsFromLayer(layer);

                            eMap.config.callbacks['draw:created'](eMap, points, e);
                        }

                    }

                });

                map.on('draw:edited', function (e) {
                    var layers = e.layers;

                    layers.eachLayer(function (layer) {
                        if (typeof (eMap.config.callbacks) !== 'undefined' && typeof (eMap.config.callbacks['draw:edited']) === 'function') {
                            if (layer.item && layer.item.type === 'polyline') {
                                var points = thisService.getPointsFromLayer(layer);

                                eMap.config.callbacks['draw:edited'](eMap, points, e);
                            }
                        }
                    });
                });

                map.on('draw:deleted', function (e) {
                    var layers = e.layers;

                    layers.eachLayer(function (layer) {
                        if (typeof (eMap.config.callbacks) !== 'undefined' && typeof (eMap.config.callbacks['draw:deleted']) === 'function') {
                            if (layer.item && layer.item.type === 'polyline') {
                                var points = thisService.getPointsFromLayer(layer);

                                eMap.config.callbacks['draw:deleted'](eMap, points, e);
                            }
                        }
                    });
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
            getSinglePointFromLayer: function (layer) {
                var latLng = layer.getLatLng();
                var point = {
                    latitude: latLng.lat,
                    longitude: latLng.lng
                };

                return point;
            },

        }

    });