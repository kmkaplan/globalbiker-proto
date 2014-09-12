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
                                    points: points,
                                    color: 'green',
                                    weight: 6,
                                    opacity: 0.3
                                });
                            } else {
                                console.info('No points for step %d.', step._id);
                            }

                            var markers = {
                                items: []
                            };

                            if (step.interests && step.interests.length > 0) {

                                markers.items = step.interests.reduce(function (output, interest) {

                                    var iconName;
                                    var markerColor;
                                    var spin = false;

                                    if (interest.type === 'interest') {

                                        switch (interest.type) {
                                        case 'interest':
                                            iconName = 'glyphicon-eye-open';
                                            markerColor = 'green';
                                            break;
                                        default:
                                            iconName = 'glyphicon-question-sign';
                                            markerColor = 'black';
                                            break;
                                        }

                                        if (interest.photos.length > 0) {
                                            trace.items.push({
                                                type: 'image',
                                                latitude: interest.latitude,
                                                longitude: interest.longitude,
                                                url: interest.photos[0].url,
                                                callbacks: {
                                                    click: function (eMap, item, itemLayer, e) {
                                                        alert("totot");
                                                        mapConfig.callbacks['interest:clicked'](interest, eMap, item, itemLayer, e);
                                                    }
                                                }
                                            });

                                        } else {

                                            trace.items.push({
                                                type: 'marker',
                                                latitude: interest.latitude,
                                                longitude: interest.longitude,
                                                icon: {
                                                    name: iconName,
                                                    markerColor: markerColor,
                                                    spin: spin
                                                },
                                                popup: {
                                                    content: '<h3>' + interest.name + '</h3>' + '<p>' + interest.description + '</p>'
                                                }
                                            });

                                        }
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