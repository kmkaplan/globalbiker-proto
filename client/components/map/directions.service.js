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

            if (args.waypoints.length < 8) {
                var promise = getDirectionsMax8WayPoints(args);
                deffered.resolve(promise);
            } else {
                var promise = getDirectionsMoreThan8WayPointsByChunks(args);
                deffered.resolve(promise);
            }


            return deffered.promise;
        }

        function getDirectionsMoreThan8WayPointsByChunks(args) {
            var deffered = $q.defer();

            // split in several requests
            var promises = [];

            var chunkOrigin = args.origin;
            var chunkDestination = null;
            var chunkWaypoints;

            for (var i = 0; i <= args.waypoints.length; i += 9) {

                if (chunkDestination !== null) {
                    // destination of last chunk is origin of new chunk
                    chunkOrigin = chunkDestination;
                }

                if ((i + 8) < args.waypoints.length) {
                    // not the last chunk
                    // extract next 8-size chunk
                    chunkWaypoints = args.waypoints.slice(i, i + 8)
                        // destination is the N+8
                    chunkDestination = args.waypoints[i + 8].location;
                    console.log('Next chunk: indexes %d to %d.', i, i + 7);
                } else {
                    // last chunk
                    if (i < args.waypoints.length) {
                        console.log('Last chunk: way points %d to %d.', i, args.waypoints.length - 1);
                    } else {
                        console.log('Last chunk without way points.');
                        chunkWaypoints = [];
                    }
                    chunkWaypoints = args.waypoints.slice(i)
                        // destination is the real destination
                    chunkDestination = args.destination;
                }

                var chunkArgs = {
                    travelMode: args.travelMode,
                    origin: chunkOrigin,
                    destination: chunkDestination,
                    waypoints: chunkWaypoints
                };
                console.log('Chunk args: ', chunkArgs);

                var promise = getDirectionsMax8WayPoints(chunkArgs);
                promises.push(promise);
            }

            $q.all(promises).then(function (geometries) {

                console.log('Merge geometris of %d chunks.', geometries.length);

                var mergedGeometry = geometries.reduce(function (mergedGeometry, geometry) {
                    if (mergedGeometry === null) {
                        mergedGeometry = geometry;
                    } else {
                        // remove first coordinates of concatenated array if same as last of existing array
                        var lastCoordinates = mergedGeometry.coordinates[mergedGeometry.coordinates.length - 1];
                        var nextCoordinates = geometry.coordinates[0];
                        if (lastCoordinates.length === nextCoordinates.length && lastCoordinates[0] === nextCoordinates[0] && lastCoordinates[1] === nextCoordinates[1]) {
                            // ignore first coordinates to avoid duplicated
                            geometry.coordinates = geometry.coordinates.slice(1);
                        } else {
                            console.log('Last: ', lastCoordinates);
                            console.log('First: ', nextCoordinates);
                        }
                        mergedGeometry.coordinates = mergedGeometry.coordinates.concat(geometry.coordinates);
                    }
                    return mergedGeometry;
                }, null);

                deffered.resolve(mergedGeometry);

            }, function (err) {
                console.error(err);
                deffered.reject(err);
            });
            return deffered.promise;
        }

        function getDirectionsMax8WayPoints(args) {

            var deffered = $q.defer();

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