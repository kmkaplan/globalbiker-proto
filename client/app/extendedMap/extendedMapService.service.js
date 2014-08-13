'use strict';

angular.module('bikeTouringMapApp')
    .service('extendedMapService', function () {
        // AngularJS will instantiate a singleton by calling "new" on this function

        return {

            drawnItemsLayer: null,

            drawControl: null,

            drawnItemsLayerByExtendedMapId: {},

            _getPointsFromLayer: function (layer) {
                var points = layer.getLatLngs().reduce(function (output, item) {
                    output.push({
                        latitude: item.lat,
                        longitude: item.lng
                    });
                    return output;
                }, []);

                return points;
            },

            enableDrawing: function (map, drawOptions, callbacks) {

                var thisService = this;

                this.drawnItemsLayer = new L.FeatureGroup();

                map.addLayer(drawnItemsLayer);


                var defaultDrawOptions = {
                    polyline: false,
                    marker: false,
                    circle: false,
                    rectangle: false,
                    polygon: false
                };

                this.drawControl = new L.Control.Draw({
                    edit: {
                        featureGroup: drawnItemsLayer
                    },
                    draw: $.extend({}, defaultDrawOptions, drawOptions)
                });
                map.addControl(drawControl);

                map.on('draw:created', function (e) {

                    if (typeof (callbacks) !== 'undefined' && typeof (callbacks['draw:created']) === 'function') {
                        var points = thisService._getPointsFromLayer(e.layer);

                        callbacks['draw:created'](map, points, e);
                    }

                });

                map.on('draw:edited', function (e) {
                    var layers = e.layers;

                    layers.eachLayer(function (layer) {
                        if (typeof (callbacks) !== 'undefined' && typeof (callbacks['draw:edited']) === 'function') {
                            var points = thisService._getPointsFromLayer(layer);

                            callbacks['draw:edited'](map, points, e);
                        }
                    });
                });

                map.on('draw:deleted', function (e) {
                    if (typeof (callbacks) !== 'undefined' && typeof (callbacks['draw:deleted']) === 'function') {
                        var points = thisService._getPointsFromLayer(e.layer);

                        callbacks['draw:deleted'](map, points, e);
                    }
                });

            },

            _getRandomId: function () {
                // TODO store the id to be sure to never generate twice the same
                return Math.floor((Math.random() * 6) + 1);
            },

            _drawItem: function (map, item) {
                if (!item.extendedMapId) {
                    // new marker: generate an internal id
                    item.extendedMapId = this._getRandomId();
                }

                if (this.drawnItemsLayerByExtendedMapId.hasOwnProperty(item.extendedMapId)) {
                    // existing item

                    // TODO compare items to avoid redrawing all of them

                    // remove the previous layer
                    this._removeItem(map, item);
                } else {
                    this.drawnItemsLayerByExtendedMapId[item.extendedMapId] = item;
                }
            },

            _drawMarker: function (map, marker) {

                this._drawItem(map, marker);

                if (!marker.latitude) {
                    console.error('Marker latitude is not defined.');
                    return;
                }
                if (!marker.longitude) {
                    console.error('Marker longitude is not defined.');
                    return;
                }
                // draw the marker
                var layer = L.marker([marker.latitude, marker.longitude]).addTo(map);

                // store the layer in the marker
                marker.layer = layer;
            },

            _drawPolyline: function (map, polyline) {

                this._drawItem(map, polyline);

                if (!Object.prototype.toString.call(polyline.points) === '[object Array]') {
                    console.error('Polyline %s points are not defined or not an array.', polyline.extendedMapId);
                    return;
                }

                var latlngs = polyline.points.reduce(function (output, point) {
                    if (!point.latitude) {
                        console.error('Point latitude is not defined for polyline %s.', polyline.extendedMapId);
                        return output;
                    }
                    if (!point.longitude) {
                        console.error('Point longitude is not defined for polyline %s.', polyline.extendedMapId);
                        return output;
                    }
                    output.push(L.latLng(point.latitude, point.longitude));
                    return output;
                }, []);

                if (latlngs.length < 2) {
                    console.error('Only %d valid points for polyline %s.', latlngs.length, polyline.extendedMapId);
                    return;
                }

                // draw the polyline
                var layer = L.polyline(latlngs, {
                    color: 'red'
                }).addTo(map);

                // store the layer in the polyline
                polyline.layer = layer;
            },
            _removeItem: function (map, item) {
                if (typeof (item.layer) !== 'undefined') {
                    // remove the item layer
                    map.removeLayer(item.layer);
                }
            },
            redrawItems: function (map, newItems, oldItems) {

                var selfService = this;

                // remove old items
                for (var groupName in oldItems) {
                    if (oldItems.hasOwnProperty(groupName)) {
                        var groupOfItems = oldItems[groupName];

                        // TODO remove only removed items

                        if (groupOfItems.items) {
                            // remove old polylines
                            groupOfItems.items.reduce(function (o, item) {

                                selfService._removeItem(map, item);

                            }, null);
                        }
                    }
                }

                for (var groupName in newItems) {
                    if (newItems.hasOwnProperty(groupName)) {
                        var groupOfItems = newItems[groupName];

                        if (groupOfItems.items) {
                            // draw items
                            groupOfItems.items.reduce(function (o, item) {
                                switch (item.type) {
                                case 'marker':
                                    selfService._drawMarker(map, item);
                                    break;
                                case 'polyline':
                                    selfService._drawPolyline(map, item);
                                    break;
                                default:
                                    console.error('Unknown type %s.', item.type);
                                    break;
                                }
                            }, null);
                        }

                    }
                }
            }
        }

    });