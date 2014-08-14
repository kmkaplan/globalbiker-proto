'use strict';

angular.module('bikeTouringMapApp')
    .service('myTourMap', function () {
        // AngularJS will instantiate a singleton by calling "new" on this function
        return {
            updateMap: function (mapConfig, tour) {

                var markers = tour.steps.reduce(function (output, item) {

                    if (!item.isValid()) {
                        // only display city markers
                        if (item.cityFrom && item.cityFrom.geonameId) {
                            output.push({
                                type: 'marker',
                                latitude: item.cityFrom.latitude,
                                longitude: item.cityFrom.longitude
                            });
                        }
                        if (item.cityTo && item.cityTo.geonameId) {
                            output.push({
                                type: 'marker',
                                latitude: item.cityTo.latitude,
                                longitude: item.cityTo.longitude
                            });
                        }
                    }
                    return output;
                }, []);

                var polylines = tour.steps.reduce(function (output, item) {

                    if (item.isValid()) {
                        // display route line
                        output.push({
                            type: 'polyline',
                            points: [{
                                latitude: item.cityFrom.latitude,
                                longitude: item.cityFrom.longitude
                        }, {
                                latitude: item.cityTo.latitude,
                                longitude: item.cityTo.longitude
                        }]
                        });
                    }
                    return output;
                }, []);

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
