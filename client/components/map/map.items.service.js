'use strict';

angular.module('globalbikerWebApp')
    .service('mapItemsService', function (extendedMapMathsService) {
        // AngularJS will instantiate a singleton by calling "new" on this function




        return {

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

                    }, []);
                }
            }
        }

    });