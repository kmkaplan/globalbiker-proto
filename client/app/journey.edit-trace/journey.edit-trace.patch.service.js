(function () {
    'use strict';

    angular.module('globalbikerWebApp').factory('JourneyEditTracePatchService', JourneyEditTracePatchService);

    function JourneyEditTracePatchService($q, DS, directionsService) {

        var service = {
            createJourney: createJourney,
            patchJourneyByPath: patchJourneyByPath
        };

        return service;

        function createJourney(journey) {
            var deffered = $q.defer();

            // create journey

            DS.create('journeys', journey).then(function (journey) {
                deffered.resolve(journey);
            }, function (err) {
                console.error(err);
                deffered.reject(err);
            })

            return deffered.promise;
        }

        function patchJourneyByPath(journey, path) {
            var deffered = $q.defer();
            var patch = null;

            if (path === '/geo/waypoints') {

                var waypoints;
                if (journey.geo.waypoints) {
                    // keep only valid way points
                    waypoints = journey.geo.waypoints.reduce(function (waypoints, wayPoint) {
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
                    value: journey.geo.cityFrom
                };
            } else if (path === '/geo/cityTo') {
                patch = {
                    op: 'replace',
                    path: path,
                    value: journey.geo.cityTo
                };
            } else {
                console.error('Invalid path "%s".', path);
                deffered.reject(new Error('Invalid path.'));
            }

            if (patch !== null) {

                var patches = [patch, {
                    op: 'replace',
                    path: '/geo/geometry',
                    value: journey.geo.geometry
                }, {
                    op: 'replace',
                    path: '/steps',
                    value: []
                }];

                DS.update('journeys', journey.reference, {
                    patches: patches
                }, {
                    method: 'patch'
                }).then(function (journey) {
                    // success
                    deffered.resolve(journey);
                }, function (err) {
                    console.error(err);
                    deffered.reject(err);
                });
            }
            return deffered.promise;
        }

    }

})();