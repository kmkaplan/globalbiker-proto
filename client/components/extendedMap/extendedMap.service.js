'use strict';

angular.module('globalbikerWebApp')
    .service('extendedMapService', function (extendedMapCoreService, extendedMapDrawService) {
        // AngularJS will instantiate a singleton by calling "new" on this function

        return {

            enableDrawing: function (eMap) {
                return extendedMapDrawService.enableDrawing(eMap);
            },

            redrawItems: function (eMap, newItemsGroups, oldItemsGroups) {
                var map = eMap.map;

                this.removeItemsGroups(eMap, oldItemsGroups);

                this.drawItemsGroups(eMap, newItemsGroups);
            },
            getLayerNameFromGroup: function (groupName, group) {
                var layerName;

                if (group.layerName) {
                    layerName = group.layerName;
                } else {
                    // use group name as layer name
                    layerName = groupName;
                }
                return layerName;
            },
            configureGroups: function (itemsGroups) {

                for (var groupName in itemsGroups) {
                    if (itemsGroups.hasOwnProperty(groupName)) {
                        var itemsGroup = itemsGroups[groupName];

                        if (!itemsGroup.layerOptions) {
                            itemsGroup.layerOptions = {};
                        }

                        if (!itemsGroup.layerOptions.name) {
                            itemsGroup.layerOptions.name = groupName;
                        }

                        if (typeof (itemsGroup.layerOptions.show) === 'undefined') {
                            itemsGroup.layerOptions.show = true;
                        }

                        if (typeof (itemsGroup.layerOptions.control) === 'undefined') {
                            itemsGroup.layerOptions.control = false;
                        }
                    }
                }
            },
            removeItemsGroups: function (eMap, itemsGroups) {
                var map = eMap.map;

                // remove all layers
                for (var i in map._layers) {
                    if (map._layers[i]._path != undefined) {
                        try {
                            map.removeLayer(map._layers[i]);
                        } catch (e) {
                            console.log("problem with " + e + map._layers[i]);
                        }
                    }
                }
                /*
                var selfService = this;

                this.configureGroups(itemsGroups);

                // remove old items
                for (var groupName in itemsGroups) {
                    if (itemsGroups.hasOwnProperty(groupName)) {
                        var itemsGroup = itemsGroups[groupName];

                        var layerName = this.getLayerNameFromGroup(groupName, itemsGroup);

                        // TODO remove only removed items

                        if (itemsGroup.items) {
                            itemsGroup.items.reduce(function (o, item) {

                                extendedMapCoreService.removeItem(eMap, itemsGroup.layerOptions, item);

                            }, null);
                        }
                    }
                }*/
            },
            drawItemsGroups: function (eMap, itemsGroups) {
                var map = eMap.map;

                var selfService = this;

                this.configureGroups(itemsGroups);

                // draw all items
                for (var groupName in itemsGroups) {
                    if (itemsGroups.hasOwnProperty(groupName)) {
                        var itemsGroup = itemsGroups[groupName];

                        var layerName = this.getLayerNameFromGroup(groupName, itemsGroup);

                        if (itemsGroup.items) {
                            // draw items
                            itemsGroup.items.reduce(function (o, item) {
                                extendedMapCoreService.drawItem(eMap, itemsGroup.layerOptions, item);
                            }, null);
                        }

                    }
                }
            }
        }

    });