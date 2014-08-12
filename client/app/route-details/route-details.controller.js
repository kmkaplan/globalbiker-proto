'use strict';

angular.module('bikeTouringMapApp')
    .controller('RouteDetailsCtrl', function ($scope, leafletData) {
        $scope.message = 'Hello';


        angular.extend($scope, {
            defaults: {
                // tileLayer: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
                tileLayer: 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg',
                scrollWheelZoom: true,
                maxZoom: 14
            },
            center: {
                lat: 43.3032,
                lng: 2.3648,
                zoom: 8
            }
        });

        leafletData.getMap('main-map').then(function (map) {

            // Initialise the FeatureGroup to store editable layers
            var drawnItems = new L.FeatureGroup();
            map.addLayer(drawnItems);

            // Initialise the draw control and pass it the FeatureGroup of editable layers
            var drawControl = new L.Control.Draw({
                edit: {
                    featureGroup: drawnItems,
                    edit: {
                        selectedPathoptions: {
                            maintainColor: true,
                            opacity: 0.3
                        }
                    },
                    remove: false
                },
                draw: {
                    polyline: {
                        shapeOptions: {
                            color: 'purple'
                        }
                    },
                    marker: {
                        shapeOptions: {
                            color: 'purple'
                        }
                    },
                    circle: false,
                    rectangle: false,
                    polygon: false
                }
            });
            map.addControl(drawControl);

            map.on('draw:created', function (e) {
                var type = e.layerType,
                    layer = e.layer;

                if (type === 'marker') {
                    // Do marker specific actions
                }

                // Do whatever else you need to. (save to db, add to map etc)
                drawnItems.addLayer(layer);
            });

        });

    });