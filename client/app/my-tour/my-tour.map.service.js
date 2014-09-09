'use strict';

angular.module('bikeTouringMapApp')
    .service('MyTourMapService', function () {
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
                                longitude: item.cityFrom.longitude,
                                icon: {
                                    name: 'glyphicon-record',
                                    spin: true
                                }
                            });
                        }
                        if (item.cityTo && item.cityTo.geonameId) {
                            output.push({
                                type: 'marker',
                                latitude: item.cityTo.latitude,
                                longitude: item.cityTo.longitude,
                                icon: {
                                    name: 'glyphicon-record'
                                }
                            });
                        }
                    }
                    return output;
                }, []);

                var isDeparture = true;

                var polylines = tour.steps.reduce(function (output, item) {

                    if (item.isValid()) {

                        if (isDeparture) {
                            // add a marker for departure
                            markers.push({
                                type: 'marker',
                                latitude: item.cityFrom.latitude,
                                longitude: item.cityFrom.longitude,
                                icon: {
                                    name: 'glyphicon-record',
                                    markerColor: 'green'
                                }
                            });
                            isDeparture = false;
                        }
                        // for now, always blue
                        var color = 'blue';
                        /*switch (item.difficulty) {
                        case 1:
                            color = 'green';
                            break;

                        case 2:
                            color = 'blue';
                            break;

                        case 3:
                            color = 'red';
                            break;

                        case 4:
                            color = 'black';
                            break;

                        }*/

                        // display route line
                        output.push({
                            type: 'polyline',
                            color: color,
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