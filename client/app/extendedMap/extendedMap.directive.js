'use strict';


angular.module('bikeTouringMapApp')
    .directive('extendedMap', function ($http, $timeout, extendedMapService, leafletData) {
        return {
            templateUrl: 'app/extendedMap/extendedMap.html',
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
                             if (bounds && bounds.length === 2 && bounds[0].length === 2 && bounds[0][0] && bounds[1].length === 2){
                                 leafletData.getMap($scope.mapId).then(function (map) {
                                //$timeout(function () {
                                    map.fitBounds(bounds);
                               // }, 1000);
                            });
                                        }
                        },
                        fitBoundsFromPoints: function (points) {

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

                                this.fitBounds(bounds);
                            }
                        }
                    };

                    var initialConfig = {
                        mapId: $scope.mapId,
                        defaults: {
                            // tileLayer: 'http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png',
                            tileLayer: 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg',
                            // tileLayer: 'http://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png',
                            // tileLayer: 'http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
                            scrollWheelZoom: true
                        },
                        center: $scope.config.initialCenter
                    };
                    
                    angular.extend($scope, initialConfig);
                    $scope.eMap = {
                        mapId: $scope.mapId,
                        config: $scope.config,
                        eLayersMap: {}
                    };

                },
                post: function postLink($scope, $element, $attrs) {

                    /* $scope.config.whenMapReady = function (callback) {
                            leafletData.getMap($scope.mapId).then(callback);
                        };*/

                    leafletData.getMap($scope.eMap.mapId).then(function (map) {

                        $scope.eMap.map = map;

                        if (typeof ($scope.config.callbacks) !== 'undefined' && typeof ($scope.config.callbacks['map:created']) === 'function') {
                            // map creation callback
                            $scope.config.callbacks['map:created']($scope.eMap);
                        }

                        /*$scope.$watch('config.polygons', function (newPolygons, oldPolygons) {

                                var polygonLayers = extendedMapService.redrawPolygons(map, newPolygons);

                                if (typeof ($scope.config.onRedraw) === 'function') {
                                    $scope.config.onRedraw(map, newPolygons, polygonLayers);
                                }

                            }, true);*/

                        if ($scope.config.drawingOptions) {
                            extendedMapService.enableDrawing($scope.eMap);
                        }

                        $scope.$watch('config.drawnItems', function (newItems, oldItems) {

                            console.info('Redraw items of map %s', $scope.eMap.mapId);

                            extendedMapService.redrawItems($scope.eMap, newItems, oldItems);

                            if (typeof ($scope.config.callbacks) !== 'undefined' && typeof ($scope.config.callbacks['items:redraw']) === 'function') {
                                $scope.config.callbacks['items:redraw']($scope.eMap, newItems, oldItems);
                            }

                        }, false);


                        // configure legend
                        /*var leafletLegend = L.control({
                                position: 'topright'
                            });

                            leafletLegend.onAdd = function (legendData, legendClass) {
                                var divs = iElement.find('div');
                                var legendDiv = divs[divs.length - 1];
                                return legendDiv;
                            };
                            leafletLegend.addTo(map);*/
                    });
                }
            }
        };
    });