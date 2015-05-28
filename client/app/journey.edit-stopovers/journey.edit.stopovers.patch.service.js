(function () {
    'use strict';

    angular.module('globalbikerWebApp').factory('JourneyEditStopoversPatchService', JourneyEditStopoversPatchService);

    function JourneyEditStopoversPatchService($q, DS, directionsService) {

        var service = {
            patchJourney: patchJourney
        };

        return service;

        function patchJourney(journey) {
            var deffered = $q.defer();

            // patch way points
            var patches = [{
                op: 'replace',
                path: '/geo/waypoints',
                value: journey.geo.waypoints
            }];

            buildStepsPatch(journey).then(function (patch) {

                if (patch !== null) {
                    // patch steps
                    patches.push(patch);
                }

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

            });

            return deffered.promise;
        }

        function buildStepsPatch(journey) {

            var deffered = $q.defer();

            journey.steps = buildSteps(journey).then(function (steps) {

                var patch = {
                    op: 'replace',
                    path: '/steps',
                    value: steps
                };
                deffered.resolve(patch);

            }, function (err) {
                console.error(err);
                deffered.reject(err);
            });

            return deffered.promise;

        }

        function buildSteps(journey) {

            var deffered = $q.defer();

            // init first step attributes
            var stepsAttributes = [
                {
                    cityFrom: journey.geo.cityFrom,
                    waypointsGeometries: []
                }
            ];

            journey.geo.waypoints.reduce(function (stepsAttributes, wayPoint) {
                var stepAttributes = stepsAttributes[stepsAttributes.length - 1];
                if (wayPoint.stopover) {
                    // set destination point
                    stepAttributes.cityTo = wayPoint.city;
                    // init next step attributes
                    stepsAttributes.push({
                        cityFrom: wayPoint.city,
                        waypointsGeometries: []
                    });
                } else {
                    stepAttributes.waypointsGeometries.push(wayPoint.city.geometry);
                }
                return stepsAttributes;
            }, stepsAttributes);

            // finalize last step attributes
            var stepAttributes = stepsAttributes[stepsAttributes.length - 1];
            stepAttributes.cityTo = journey.geo.cityTo;

            if (stepsAttributes.length === 0) {
                // only one step: same as journey geometry
                var stepAttributes = stepsAttributes[0];
                deffered.resolve({
                    cityFrom: stepAttributes.cityFrom,
                    cityTo: stepAttributes.cityTo,
                    geometry: journey.geo.geometry
                });
            } else {
                // calculate geometry for every step

                var promises = stepsAttributes.reduce(function (promises, stepAttributes) {

                    promises.push(buildStep(stepAttributes));
                    return promises;
                }, []);

                $q.all(promises).then(function (steps) {
                    deffered.resolve(steps);
                }, function (err) {
                    console.error(err);
                    deffered.reject(err);
                });

            }
            return deffered.promise;
        }

        function buildStep(stepAttributes) {
            var deffered = $q.defer();

            directionsService.getDirections(stepAttributes.cityFrom.geometry, stepAttributes.cityTo.geometry, stepAttributes.waypointsGeometries)
                .then(function (geometry) {
                    // success
                    deffered.resolve({
                        geo: {
                            cityFrom: stepAttributes.cityFrom,
                            cityTo: stepAttributes.cityTo,
                            geometry: geometry
                        }
                    });
                }, function (err) {
                    // error
                    console.error(err);
                });

            return deffered.promise;
        }

    }

})();