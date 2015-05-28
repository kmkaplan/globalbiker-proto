(function () {
    'use strict';

    angular.module('globalbikerWebApp').factory('JourneyEditTraceTourPatchService', JourneyEditTraceTourPatchService);

    function JourneyEditTraceTourPatchService($q, DS, directionsService) {

        var service = {
            createTour: createTour,
            patchTourByPath: patchTourByPath
        };

        return service;

        function createTour(tour) {
            var deffered = $q.defer();

            // create tour

            DS.create('tours', tour).then(function (tour) {
                deffered.resolve(tour);
            }, function (err) {
                console.error(err);
                deffered.reject(err);
            })

            return deffered.promise;
        }
        
        function patchTourByPath(tour, path) {
            var deffered = $q.defer();
            var patch = null;

            if (path === '/geo/waypoints') {

                var waypoints;
                if (tour.geo.waypoints) {
                    // keep only valid way points
                    waypoints = tour.geo.waypoints.reduce(function (waypoints, wayPoint) {
                        if (wayPoint && wayPoint.city && wayPoint.city.geometry) {
                            waypoints.push(wayPoint);
                        }
                        return waypoints;
                    }, []);
                } else {
                    waypoints = [];
                }

                patch = {
                    op: 'replace',
                    path: path,
                    value: waypoints
                };
            } else if (path === '/geo/cityFrom') {
                patch = {
                    op: 'replace',
                    path: path,
                    value: tour.geo.cityFrom
                };
            } else if (path === '/geo/cityTo') {
                patch = {
                    op: 'replace',
                    path: path,
                    value: tour.geo.cityTo
                };
            } else {
                console.error('Invalid path "%s".', path);
                deffered.reject(new Error('Invalid path.'));
            }

            if (patch !== null) {

                var patches = [patch, {
                    op: 'replace',
                    path: '/geo/geometry',
                    value: tour.geo.geometry
                }];

                DS.update('tours', tour._id, {
                    patches: patches
                }, {
                    method: 'patch'
                }).then(function (tour) {
                    // success
                    deffered.resolve(tour);
                }, function (err) {
                    console.error(err);
                    deffered.reject(err);
                });
            }
            return deffered.promise;
        }

    }

})();