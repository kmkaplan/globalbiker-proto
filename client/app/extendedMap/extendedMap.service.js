'use strict';

angular.module('bikeTouringMapApp')
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
            
            removeItemsGroups: function (eMap, itemsGroups) {
                var map = eMap.map;

                var selfService = this;

                // remove old items
                for (var groupName in itemsGroups) {
                    if (itemsGroups.hasOwnProperty(groupName)) {
                        var itemsGroup = itemsGroups[groupName];

                        // TODO remove only removed items

                        if (itemsGroup.items) {
                            itemsGroup.items.reduce(function (o, item) {

                                extendedMapCoreService.removeItem(eMap, 'draw', item);

                            }, null);
                        }
                    }
                }
            },
            drawItemsGroups: function (eMap, itemsGroups) {
                var map = eMap.map;

                var selfService = this;

                // draw all items
                for (var groupName in itemsGroups) {
                    if (itemsGroups.hasOwnProperty(groupName)) {
                        var itemsGroup = itemsGroups[groupName];

                        if (itemsGroup.items) {
                            // draw items
                            itemsGroup.items.reduce(function (o, item) {
                                extendedMapCoreService.drawItem(eMap, 'draw', item);
                            }, null);
                        }

                    }
                }
            }
            
        }

    });