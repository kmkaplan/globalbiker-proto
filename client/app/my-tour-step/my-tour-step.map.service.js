'use strict';

angular.module('bikeTouringMapApp')
    .service('MyTourStepMapService', function () {
        // AngularJS will instantiate a singleton by calling "new" on this function
        return {
            updateTrace: function (mapConfig, step, steppoints) {
                var trace = {
                    items: []
                };

                if (steppoints.length > 1) {

                    var points = steppoints.reduce(function (output, p) {

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
                    var first = steppoints[0];
                    trace.items.push({
                        type: 'marker',
                        latitude: first.latitude,
                        longitude: first.longitude,
                        icon: {
                            name: 'glyphicon-home',
                            markerColor: 'green'
                        }
                    });

                    var last = steppoints[steppoints.length - 1];

                    trace.items.push({
                        type: 'marker',
                        latitude: last.latitude,
                        longitude: last.longitude,
                        icon: {
                            name: 'glyphicon-record',
                            markerColor: 'red'
                        }
                    });

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
            updateInterests: function (mapConfig, step) {

                var markers = {
                    items: []
                };

                if (step && step.interests && step.interests.length > 0) {

                    markers.items = step.interests.reduce(function (output, interest) {

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

                        if (interest.photos.length > 0) {
                            output.push({
                                type: 'image',
                                latitude: interest.latitude,
                                longitude: interest.longitude,
                                url: interest.photos[0].url,
                                callbacks: {
                                    click: function (eMap, item, itemLayer, e) {
                                        mapConfig.callbacks['interest:clicked'](interest, eMap, item, itemLayer, e);
                                    }
                                }
                            });

                        }
                        output.push({
                            type: 'marker',
                            latitude: interest.latitude,
                            longitude: interest.longitude,
                            icon: {
                                name: iconName,
                                markerColor: markerColor,
                                spin: spin
                            },
                            callbacks: {
                                click: function (eMap, item, itemLayer, e) {
                                    mapConfig.callbacks['interest:clicked'](interest, eMap, item, itemLayer, e);
                                }
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