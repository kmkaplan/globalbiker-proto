'use strict';

angular.module('globalbikerWebApp')
    .service('mapItemsService', function (extendedMapMathsService) {
        // AngularJS will instantiate a singleton by calling "new" on this function


        return {

            clearMap: function (map) {
                if (map._gb) {
                    if (map._gb.layers.length !== 0) {
                        console.debug('Remove %d layers.', map._gb.layers.length);
                        map._gb.layers.reduce(function (o, layer) {
                            map.removeLayer(layer);
                        }, null);
                        map._gb.layers = [];
                    }

                }
            },

            drawItems: function (map, items, config) {

                if (items) {
                    console.info('Draw %d items to the map.', items.length);

                    return items.reduce(function (items, item) {

                        // check input parameters
                        if (!item.type) {
                            console.error('Item type is not defined.');
                            return;
                        }
                        if (!item.geometry) {
                            console.error('Item geometry is not defined.');
                            return;
                        }
                        if (!item.properties) {
                            console.warn('Item properties is not defined.');
                            item.properties = {};
                        }

                        var itemLayer = L.geojsonLayer(item, {});

                        // add it to the layer
                        map.addLayer(itemLayer);

                        if (!map._gb) {
                            map._gb = {
                                layers: []
                            };
                        }

                        map._gb.layers.push(itemLayer);

                    }, []);
                }
            }
        }

    });