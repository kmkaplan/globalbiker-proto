(function () {
    'use strict';

    angular.module('globalbikerWebApp').factory('JourneyEditStopoversTourPatchService', JourneyEditStopoversTourPatchService);

    function JourneyEditStopoversTourPatchService($q, DS, directionsService) {

        var service = {
            patchTour: patchTour
        };

        return service;

        function patchTour(tour) {
            var deffered = $q.defer();

            // patch way points
            var patches = [{
                op: 'replace',
                path: '/geo/waypoints',
                value: tour.geo.waypoints
            }];

            buildStepsPatch(tour).then(function (patch) {

                if (patch !== null) {
                    // patch steps
                    patches.push(patch);
                }

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

            });

            return deffered.promise;
        }

        function buildStepsPatch(tour) {

            var deffered = $q.defer();

            tour.steps = buildSteps(tour).then(function (steps) {

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

        function buildSteps(tour) {

            var deffered = $q.defer();

            // init first step attributes
            var stepsAttributes = [
                {
                    cityFrom: tour.geo.cityFrom,
                    waypointsGeometries: []
                }
            ];

            tour.geo.waypoints.reduce(function (stepsAttributes, wayPoint) {
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
            stepAttributes.cityTo = tour.geo.cityTo;

            if (stepsAttributes.length === 0) {
                // only one step: same as tour geometry
                var stepAttributes = stepsAttributes[0];
                deffered.resolve({
                    cityFrom: stepAttributes.cityFrom,
                    cityTo: stepAttributes.cityTo,
                    geometry: tour.geo.geometry
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