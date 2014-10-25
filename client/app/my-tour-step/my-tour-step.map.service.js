'use strict';

angular.module('globalbikerWebApp')
    .service('MyTourStepMapService', function () {
        // AngularJS will instantiate a singleton by calling "new" on this function
        return {
            
            updateInterests: function (mapConfig, step) {

                var markers = {
                    layerOptions: {
                        name: 'draw'
                    },
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