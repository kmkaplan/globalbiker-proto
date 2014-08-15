'use strict';

angular.module('bikeTouringMapApp')
    .service('MyTourStepMapService', function () {
        // AngularJS will instantiate a singleton by calling "new" on this function
        return {
            updateMap: function (mapConfig, step) {

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



                    mapConfig.drawnItems = {
                        trace: {
                            items: [{
                                type: 'polyline',
                                points: points
                                    }]

                        }
                    };

                    mapConfig.control.fitBounds(bounds);

                }else{
                    mapConfig.drawnItems = {};
                }

            }

        };
    });