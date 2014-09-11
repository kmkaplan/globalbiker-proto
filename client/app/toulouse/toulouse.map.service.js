'use strict';

angular.module('bikeTouringMapApp')
    .service('ToulouseMapService', function () {

        return {
            updateTours: function (mapConfig, tours) {

                console.info('Update map.');

                var trace = {
                    items: []
                };

                tours.reduce(function (output1, tour) {

                    if (tour.steps) {

                        tour.steps.reduce(function (output2, step) {

                            if (step.points && step.points.length > 1) {

                                // build points
                                var points = step.points.reduce(function (output, p) {

                                    output.push({
                                        latitude: p.latitude,
                                        longitude: p.longitude
                                    });
                                    return output;
                                }, []);

                                // define trace
                                trace.items.push({
                                    type: 'polyline',
                                    points: points
                                });
                            } else {
                                console.info('No points for step %d.', step._id);
                            }

                            var markers = {
                                items: []
                            };

                            if (step.interests && step.interests.length > 0) {

                                markers.items = step.interests.reduce(function (output, marker) {

                                    var iconName;
                                    var markerColor;
                                    var spin = false;

                                    if (marker.type === 'interest') {

                                        switch (marker.type) {
                                        case 'interest':
                                            iconName = 'glyphicon-eye-open';
                                            markerColor = 'green';
                                            break;
                                        default:
                                            iconName = 'glyphicon-question-sign';
                                            markerColor = 'black';
                                            break;
                                        }

                                        trace.items.push({
                                            type: 'marker',
                                            latitude: marker.latitude,
                                            longitude: marker.longitude,
                                            icon: {
                                                name: iconName,
                                                markerColor: markerColor,
                                                spin: spin
                                            },
                                            popup: {
                                                content: '<h3>' + marker.name + '</h3>' + '<p>' + marker.description + '</p>'
                                            }
                                        });
                                    }

                                    return output;

                                }, []);
                            }

                        }, []);
                    } else {
                        console.info('No steps for tour %d.', tour._id);
                    }

                }, []);

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

            }
        }
    });