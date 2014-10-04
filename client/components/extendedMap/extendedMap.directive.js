'use strict';


angular.module('bikeTouringMapApp')
    .directive('extendedMap', function ($http, $timeout, extendedMapService, leafletData) {
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
                        fitBoundsFromPoints: function (points, margin) {
                            console.info('Fit to bounds from points.');

                            if (points) {
                                var bounds = [[null, null], [null, null]];

                                points.reduce(function (output, p) {

                                    if (!p.latitude) {
                                        console.warn('Invalid point latitude.');
                                    }

                                    if (!p.longitude) {
                                        console.warn('Invalid point longitude.');
                                    }

                                    if (bounds[0][0] === null || bounds[0][0] > p.latitude) {
                                        bounds[0][0] = p.latitude;
                                    }

                                    if (bounds[1][0] === null || bounds[1][0] < p.latitude) {
                                        bounds[1][0] = p.latitude;
                                    }

                                    if (bounds[0][1] === null || bounds[0][1] > p.longitude) {
                                        bounds[0][1] = p.longitude;
                                    }

                                    if (bounds[1][1] === null || bounds[1][1] < p.longitude) {
                                        bounds[1][1] = p.longitude;
                                    }
                                    return output;
                                }, []);

                                if (margin) {
                                    var latitudeMargin = (bounds[1][0] - bounds[0][0]) * margin;
                                    bounds[0][0] -= latitudeMargin;
                                    bounds[1][0] += latitudeMargin

                                    var longitudeMargin = (bounds[1][1] - bounds[0][1]) * margin;
                                    bounds[0][1] -= longitudeMargin;
                                    bounds[1][1] += longitudeMargin
                                }

                                this.fitBounds(bounds);
                            }
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

                    $scope.eMap.addItemsToGroup = function (groupName, items, replaceAll) {

                        // var drawnItems = angular.copy($scope.config.drawnItems);

                        // FIXME angular.copy fails when running simultaneous copies (or too eavy ones?) so the following is faster, but does it work as angular.watch old items will be the same?

                        var drawnItems = {};

                        if ($scope.config.drawnItems) {
                            for (var key in $scope.config.drawnItems) {
                                if ($scope.config.drawnItems.hasOwnProperty(key)) {
                                    drawnItems[key] = $scope.config.drawnItems[key];
                                }
                            }
                        }

                        if (!drawnItems[groupName]) {
                            drawnItems[groupName] = {
                                items: []
                            };
                        }
                        if (replaceAll && replaceAll === true) {
                            console.debug('Replace %d items by %d ones to group "%s" of map %s', drawnItems[groupName].items.length, items.length, groupName, $scope.eMap.mapId);
                            drawnItems[groupName].items = items;
                        } else {
                            console.debug('Add %d items to group "%s" of map %s', items.length, groupName, $scope.eMap.mapId);
                            drawnItems[groupName].items = drawnItems[groupName].items.concat(items);
                        }

                        // trigger change
                        $scope.config.drawnItems = drawnItems;
                    }

                },
                post: function postLink($scope, $element, $attrs) {

                    leafletData.getMap($scope.eMap.mapId).then(function (map) {

                        $scope.eMap.map = map;

                        if (typeof ($scope.config.callbacks) !== 'undefined' && typeof ($scope.config.callbacks['map:created']) === 'function') {
                            // map creation callback
                            $scope.config.callbacks['map:created']($scope.eMap);
                        }

                        if ($scope.config.drawingOptions) {
                            extendedMapService.enableDrawing($scope.eMap);
                        }

                        $scope.$watch('config.drawnItems', function (newItems, oldItems) {

                            console.info('Redraw items of map %s (%d groups vs %d ones before)', $scope.eMap.mapId, _.keys(newItems).length ,_.keys(oldItems).length);

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