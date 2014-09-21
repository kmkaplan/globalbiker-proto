'use strict';

angular.module('bikeTouringMapApp')
    .service('ToulouseMapService', function ( GeoConverter) {

        return {
            updateBikelanes: function (mapConfig, bikelanes) {
                if (bikelanes) {

                    var bikelanesPolylines = bikelanes.reduce(function (polylines, bikelane) {

                        var points = GeoConverter.toLatLng(bikelane.points);

                        polylines.push({
                            type: 'polyline',
                            color: '#82c17d',
                            weight: 3,
                            opacity: 0.5,
                            points: points
                        });

                        return polylines;
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

                    drawnItems.bikelanes = {
                        items: bikelanesPolylines
                    };

                    // trigger changes
                    mapConfig.drawnItems = drawnItems;
                }
            },
            updateTours: function (mapConfig, tours) {

                console.info('Update map.');

                var trace = {
                    items: []
                };

                tours.reduce(function (output1, tour) {

                    var color = '#' + Math.floor(Math.random() * 16777215).toString(16);

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
                                    color: color,
                                    weight: 6,
                                    opacity: 0.5,
                                    callbacks: {
                                        click: function (eMap, item, itemLayer, e) {
                                            mapConfig.callbacks['step:clicked'](step, eMap, item, itemLayer, e);
                                        }
                                    }
                                });
                            } else {
                                console.info('No points for step %d.', step._id);
                                // define trace from cityFrom to cityTo
                                trace.items.push({
                                    type: 'polyline',
                                    points: [step.cityFrom, step.cityTo],
                                    color: color,
                                    weight: 6,
                                    opacity: 0.5,
                                    dashArray: '3 10',
                                    callbacks: {
                                        click: function (eMap, item, itemLayer, e) {
                                            mapConfig.callbacks['step:clicked'](step, eMap, item, itemLayer, e);
                                        }
                                    }
                                });
                            }

                            var markers = {
                                items: []
                            };

                            if (step.interests && step.interests.length > 0) {

                                markers.items = step.interests.reduce(function (output, interest) {

                                    var showInterest = false;
                                    if (interest.priority === 1) {
                                        // visible items
                                        if (mapConfig.configuration.interests.visible.show) {
                                            showInterest = true;
                                        }
                                    } else {
                                        // invisible items
                                        if (mapConfig.configuration.interests.invisible.show) {
                                            showInterest = true;
                                        }
                                    }

                                    if (!showInterest) {
                                        return output;
                                    }

                                    var iconName;
                                    var markerColor;
                                    var spin = false;


                                    switch (interest.type) {
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

                                    var opacity;
                                    if (interest.priority === 1) {
                                        // visible
                                        opacity = 1;
                                    } else {
                                        // invisible
                                        opacity = 0.5;
                                    }


                                    if (interest.photos.length > 0) {
                                        trace.items.push({
                                            type: 'image',
                                            latitude: interest.latitude,
                                            longitude: interest.longitude,
                                            url: interest.photos[0].url,
                                            opacity: opacity,
                                            callbacks: {
                                                click: function (eMap, item, itemLayer, e) {
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
                                            },
                                            opacity: opacity,
                                            callbacks: {
                                                click: function (eMap, item, itemLayer, e) {
                                                    mapConfig.callbacks['interest:clicked'](interest, eMap, item, itemLayer, e);
                                                }
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