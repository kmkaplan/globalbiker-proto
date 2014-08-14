'use strict';

angular.module('bikeTouringMapApp')
    .service('MyTourStepMapService', function () {
        // AngularJS will instantiate a singleton by calling "new" on this function
        return {
            updateMap: function (mapConfig, step) {

                var markers = [];
                var polylines = [];

                if (step.cityTo) {
                    markers.push({
                        type: 'marker',
                        latitude: step.cityTo.latitude,
                        longitude: step.cityTo.longitude
                    });
                }

                mapConfig.drawnItems = {
                    routesCities: {
                        items: markers
                    },
                    routesPaths: {
                        items: polylines
                    }
                };

            }

        };
    });