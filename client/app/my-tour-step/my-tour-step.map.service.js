'use strict';

angular.module('bikeTouringMapApp')
    .service('MyTourStepMapService', function () {
        // AngularJS will instantiate a singleton by calling "new" on this function
        return {
            updateTrace: function (mapConfig, step) {
                var trace = {
                    items: []
                };

                if (step && step.points && step.points.length > 1) {

                    var bounds = [[null, null], [null, null]];

                    var points = step.points.reduce(function (output, p) {

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
                        output.push({
                            latitude: p.latitude,
                            longitude: p.longitude
                        });
                        return output;
                    }, []);



                    trace.items = [{
                        type: 'polyline',
                        points: points
                        }];

                } else {
                    if (step && step.cityFrom && step.cityTo) {

                        trace.items.push({
                            type: 'marker',
                            latitude: step.cityFrom.latitude,
                            longitude: step.cityFrom.longitude,
                            icon: {
                                name: 'glyphicon-home',
                                markerColor: 'green'
                            }
                        });

                        trace.items.push({
                            type: 'marker',
                            latitude: step.cityTo.latitude,
                            longitude: step.cityTo.longitude,
                            icon: {
                                name: 'glyphicon-record',
                                markerColor: 'red'
                            }
                        });
                    }

                }

                // create a new object to be able to trigger the changes to angular scope (without have to $watch the whole array of objects)
                var drawnItems = {};

                if (mapConfig.drawnItems) {
                    for (var key in mapConfig.drawnItems) {
                        if (mapConfig.drawnItems.hasOwnProperty(key)) {
                            drawnItems[key] = mapConfig.drawnItems[key];
                        }
                    }
                }

                drawnItems.trace = trace;

                // trigger changes
                mapConfig.drawnItems = drawnItems;

            },
            updateMarkers: function (mapConfig, step) {

                var markers = {
                    items: []
                };

                if (step && step.markers && step.markers.length > 0) {

                    markers.items = step.markers.reduce(function (output, marker) {

                        var iconName;
                        var markerColor;
                        var spin = false;
                        switch (marker.type) {
                        case 'interest':
                            iconName = 'glyphicon-eye-open';
                            markerColor = 'green';
                            break;
                        case 'bike-shops':
                            iconName = 'glyphicon-wrench';
                            markerColor = 'pink';
                            break;
                        case 'food':
                            iconName = 'glyphicon-cutlery';
                            markerColor = 'black';
                            break;
                        case 'danger':
                            iconName = 'fa-exclamation-triangle';
                            markerColor = 'red';
                            spin = true;
                            break;
                        default:
                            iconName = 'glyphicon-question-sign';
                            markerColor = 'black';
                            break;
                        }

                        output.push({
                            type: 'marker',
                            latitude: marker.latitude,
                            longitude: marker.longitude,
                            icon: {
                                name: iconName,
                                markerColor: markerColor,
                                spin: spin
                            }
                        });

                        return output;

                    }, []);
                }

                 // create a new object to be able to trigger the changes to angular scope (without have to $watch the whole array of objects)
                var drawnItems = {};

                if (mapConfig.drawnItems) {
                    for (var key in mapConfig.drawnItems) {
                        if (mapConfig.drawnItems.hasOwnProperty(key)) {
                            drawnItems[key] = mapConfig.drawnItems[key];
                        }
                    }
                }

                drawnItems.markers = markers;

                // trigger changes
                mapConfig.drawnItems = drawnItems;

            }

        };
    });