'use strict';


angular.module('bikeTouringMapApp')
    .directive('extendedMap', function ($http, $timeout, extendedMapService, extendedMapMathsService, leafletData) {
        return {
            templateUrl: 'components/extendedMap/extendedMap.html',
            restrict: 'EA',
            scope: {
                config: '='
            },
            link: {
                pre: function preLink($scope, $element, $attrs) {

                    $scope.mapId = 'map' + $scope.$id;

                    if (!$scope.config) {
                        console.warn('No config provided for map %s. Default settings are used.', $scope.mapId);
                        $scope.config = {};
                    }

                    if (!$scope.config.initialCenter) {
                        $scope.config.initialCenter = {
                            lat: 43.6220,
                            lng: 1.3850,
                            zoom: 4
                        };
                    }

                    if (!$scope.config.class) {
                        $scope.config.class = '';
                    }

                    $scope.config.class += ' default-extended-map';

                    if (!$scope.config.drawnItems) {
                        // drawnItems is an object in order to let group items by category ('buildings', 'roads', 'forests', ...).
                        $scope.config.drawnItems = {};
                    }

                    $scope.config.control = {
                        fitBounds: function (bounds) {
                            console.info('Fit to bounds.');
                            if (bounds && bounds.length === 2 && bounds[0].length === 2 && bounds[0][0] && bounds[1].length === 2) {
                                leafletData.getMap($scope.mapId).then(function (map) {
                                    //$timeout(function () {
                                    map.fitBounds(bounds);
                                    // }, 1000);
                                });
                            }
                        },
                        fitBoundsFromGeometries: function (geometries, margin) {
                            var bounds = extendedMapMathsService.getBoundsFromGeometries(geometries, margin);
                            if (bounds) {
                                console.info('Fit to bounds from geometries.');
                                this.fitBounds(bounds);
                            }
                            return bounds;
                        },
                        fitBoundsFromGeometry: function (geometry, margin) {
                            var bounds = extendedMapMathsService.getBoundsFromGeometry(geometry, margin);
                            if (bounds) {

                                console.info('Fit to bounds from geometry.');
                                this.fitBounds(bounds);
                            }
                            return bounds;
                        },
                        fitBoundsFromPoints: function (points, margin) {
                            var bounds = extendedMapMathsService.getBoundsFromPoints(points, margin);
                            if (bounds) {
                                console.info('Fit to bounds from points.');
                                this.fitBounds(bounds);
                            }
                            return bounds;
                        }
                    };

                    var initialConfig = {
                        mapId: $scope.mapId,
                        defaults: {
                            //  tileLayer: 'http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png',
                            tileLayer: 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg',
                            //  tileLayer: 'http://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png',
                            //   tileLayer: 'http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
                            scrollWheelZoom: true,
                            //  crs: 'EPSG3943',tms: true
                        },
                        center: $scope.config.initialCenter
                    };

                    angular.extend($scope, initialConfig);
                    $scope.eMap = {
                        mapId: $scope.mapId,
                        config: $scope.config,
                        eLayersMap: {}
                    };

                    $scope.eMap.addItemsToGroup = function (items, layerOptions, replaceAll) {

                        if (items instanceof Array === false) {
                            console.error('Items %s is not an array.', items);
                            return null;
                        }
                        
                        // var drawnItems = angular.copy($scope.config.drawnItems);

                        // FIXME angular.copy fails when running simultaneous copies (or too eavy ones?) so the following is faster, but does it work as angular.watch old items will be the same?
                       

                        var groupName = layerOptions.name;

                        var drawnItems ;//= {};

                      /*  if ($scope.config.drawnItems) {
                            for (var key in $scope.config.drawnItems) {
                                if ($scope.config.drawnItems.hasOwnProperty(key)) {
                                    drawnItems[key] = $scope.config.drawnItems[key];
                                }
                            }
                        }*/
                        
                        drawnItems = _.clone($scope.config.drawnItems);

                        if (!drawnItems[groupName]) {
                            drawnItems[groupName] = {
                                layerOptions: layerOptions,
                                items: []
                            };
                        }
                        
                        if (!replaceAll || replaceAll === true) {
                            console.debug('Replace %d item(s) by %d in group "%s" of map %s', drawnItems[groupName].items.length, items.length, groupName, $scope.eMap.mapId);
                            drawnItems[groupName].items = items;
                        } else {
                            console.debug('Add %d item(s) in group "%s" of map %s', items.length, groupName, $scope.eMap.mapId);
                            drawnItems[groupName].items = drawnItems[groupName].items.concat(items);
                        }

                        // trigger change
                        $scope.config.drawnItems = drawnItems;
                    }

                },
                post: function postLink($scope, $element, $attrs) {

                    leafletData.getMap($scope.eMap.mapId).then(function (map) {

                        map.on('zoomend', function () {
                            for (var key in $scope.eMap.eLayersMap) {
                                if ($scope.eMap.eLayersMap.hasOwnProperty(key)) {
                                    var layer = $scope.eMap.eLayersMap[key].layer;

                                    if (layer.layerOptions && layer.layerOptions.zoom) {
                                        if (!layer.layerOptions.zoom.min) {
                                            layer.layerOptions.zoom.min = 0
                                        }
                                        if (!layer.layerOptions.zoom.max) {
                                            layer.layerOptions.zoom.max = 20
                                        }
                                        /*  if (layer.layerOptions.zoom.min <= map.getZoom() && map.getZoom() <= layer.layerOptions.zoom.max) {
                                            layer.show();
                                        } else {
                                            layer.hide();
                                        }*/
                                        // TODO
                                    }
                                }
                            }

                        });

                        $scope.eMap.map = map;

                        if (typeof ($scope.config.callbacks) !== 'undefined' && typeof ($scope.config.callbacks['map:created']) === 'function') {
                            // map creation callback
                            $scope.config.callbacks['map:created']($scope.eMap);
                        }

                        if ($scope.config.drawingOptions) {
                            extendedMapService.enableDrawing($scope.eMap);
                        }

                        $scope.$watch('config.drawnItems', function (newItems, oldItems) {

                            console.info('Redraw items of map %s (%d groups vs %d ones before)', $scope.eMap.mapId, _.keys(newItems).length, _.keys(oldItems).length);

                            extendedMapService.redrawItems($scope.eMap, newItems, oldItems);



                            if (typeof ($scope.config.callbacks) !== 'undefined' && typeof ($scope.config.callbacks['items:redraw']) === 'function') {
                                $scope.config.callbacks['items:redraw']($scope.eMap, newItems, oldItems);
                            }

                        }, false);
                    });
                }
            }
        };
    });