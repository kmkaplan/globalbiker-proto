'use strict';

angular.module('bikeTouringMapApp')
    .service('MyTourStepMapService', function () {
        // AngularJS will instantiate a singleton by calling "new" on this function
        return {
            updateMap: function (mapConfig, step) {

                var drawnItems = {};

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



                    drawnItems.trace = {
                        items: [{
                            type: 'polyline',
                            points: points
                                    }]


                    };

                    mapConfig.control.fitBounds(bounds);

                }

                if (step && step.markers && step.markers.length > 0) {

                    var markers = step.markers.reduce(function (output, marker) {

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



                    drawnItems.markers = {
                        items: markers
                    };
                }

                mapConfig.drawnItems = drawnItems;

            }

        };
    });