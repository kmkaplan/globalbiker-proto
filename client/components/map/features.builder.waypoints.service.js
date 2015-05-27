(function () {

    'use strict';

    angular.module('globalbikerWebApp').factory('waypointsMarkerBuilderService', waypointsMarkerBuilderService);

    function waypointsMarkerBuilderService() {

        var service = {
            buildAll: buildAll
        };

        return service;

        function buildAll(waypoints, events) {

            if (!waypoints) {
                waypoints = [];
            }

            var features = waypoints.reduce(function (features, waypoint) {

                if (waypoint.city && waypoint.city.geometry) {

                    var feature = {
                        type: 'Point',
                        geometry: waypoint.city.geometry,
                        properties: {
                            circle: {
                                radius: 3,
                                fillColor: 'grey',
                                color: 'black',
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 1
                            }, 
                            label: waypoint.city.name
                        }
                    };

                    if (waypoint.stopover) {
                        // stopover
                        feature.properties.circle.fillColor = 'red';
                        feature.properties.circle.color = 'red';
                    }else{
                        // transit
                        feature.properties.circle.fillColor = 'blue';
                        feature.properties.circle.color = 'blue';
                    }
                    if (events) {
                        feature.properties.events = events
                    };
                    feature.model = {
                        type: 'waypoint',
                        waypoint: waypoint
                    }
                    features.push(feature);
                }
                return features;
            }, []);

            return features;
        }
    }
})();