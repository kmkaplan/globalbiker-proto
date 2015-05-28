(function () {

    'use strict';

    angular.module('globalbikerWebApp').factory('directionsService', directionsService);

    function directionsService($q, googleDirections) {

        var service = {
            getDirections: getDirections
        };

        return service;

        function getDirections(originGeometry, destinationGeometry, wayPointsGeometries) {

            var deffered = $q.defer();

            var args = {
                travelMode: 'bicycling',
                origin: toGoogleDirectionsString(originGeometry),
                destination: toGoogleDirectionsString(destinationGeometry),
                waypoints: wayPointsGeometries.reduce(function (waypoints, wayPointGeometry) {
                    if (wayPointGeometry) {
                        waypoints.push({
                            location: toGoogleDirectionsString(wayPointGeometry)
                        });
                    }
                    return waypoints;
                }, [])
            }

            googleDirections.getDirections(args).then(function (directions) {

                if (directions.status === 'OK' && directions.routes.length > 0) {
                    var route = directions.routes[0];
                    var coordinates = route.overview_path.reduce(function (coordinates, point) {
                        coordinates.push([point.lng(), point.lat()]);
                        return coordinates;
                    }, []);

                    var geometry = {
                        type: 'LineString',
                        coordinates: coordinates
                    };

                    console.info('Direction calculated successfully.');
                    deffered.resolve(geometry);
                } else {
                    console.error('Error getting direction', directions);
                    deffered.reject(new Error('Error getting direction.'));
                }
            }, function (err) {
                console.error(err);
                deffered.reject(err);
            });

            return deffered.promise;
        }

        function toGoogleDirectionsString(geometry) {
            return '' + geometry.coordinates[1] + ',' + geometry.coordinates[0];
        }


    }

})();