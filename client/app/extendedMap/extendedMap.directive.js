'use strict';


angular.module('bikeTouringMapApp')
    .directive('extendedMap', function ($http, extendedMapService, leafletData) {
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
                        $scope.config.class = 'default-extended-map';
                    }

                    if (!$scope.config.drawnItems) {
                        // drawnItems is an object in order to let group items by category ('buildings', 'roads', 'forests', ...).
                        $scope.config.drawnItems = {};
                    }

                    $scope.config.control = {
                        fitBounds: function (bounds) {
                            leafletData.getMap($scope.mapId).then(function (map) {
                                map.fitBounds(bounds);
                            });
                        }
                    };

                    angular.extend($scope, {
                        mapId: $scope.mapId,
                        defaults: {
                            tileLayer: 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg',
                            scrollWheelZoom: true
                        },
                        center: $scope.config.initialCenter,
                    });
                },
                post: function postLink($scope, $element, $attrs) {

                    /* $scope.config.whenMapReady = function (callback) {
                            leafletData.getMap($scope.mapId).then(callback);
                        };*/

                    leafletData.getMap($scope.mapId).then(function (map) {


                        if (typeof ($scope.config.callbacks) !== 'undefined' && typeof ($scope.config.callbacks['map:created']) === 'function') {
                            // map creation callback
                            $scope.config.callbacks['map:created'](map);
                        }

                        /*$scope.$watch('config.polygons', function (newPolygons, oldPolygons) {

                                var polygonLayers = extendedMapService.redrawPolygons(map, newPolygons);

                                if (typeof ($scope.config.onRedraw) === 'function') {
                                    $scope.config.onRedraw(map, newPolygons, polygonLayers);
                                }

                            }, true);*/

                        if ($scope.config.drawingOptions) {
                            extendedMapService.enableDrawing(map, $scope.config.drawingOptions, $scope.config.callbacks);
                        }

                        $scope.$watch('config.drawnItems', function (newItems, oldItems) {

                            console.info('Redraw items of map %s', $scope.mapId);

                            extendedMapService.redrawItems(map, newItems, oldItems);

                            if (typeof ($scope.config.callbacks) !== 'undefined' && typeof ($scope.config.callbacks['items:redraw']) === 'function') {
                                $scope.config.callbacks['items:redraw'](map, newItems, oldItems);
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
