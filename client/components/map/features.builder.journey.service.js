(function () {

    'use strict';

    angular.module('globalbikerWebApp').factory('journeyFeaturesBuilderService', journeyFeaturesBuilderService);

    function journeyFeaturesBuilderService(stepFeaturesBuilderService, interestsMarkerBuilderService, waypointsMarkerBuilderService) {

        var service = {
            build: build,
            buildAll: buildAll,
            buildFeatures: buildFeatures
        };

        return service;

        function buildFeatures(journey, options) {

            if (!options) {
                options = {};
            }

            var features = [];

            var showSteps;
            if (options.steps === false) {
                showSteps = false;
            } else {
                showSteps = true;
            }

            if (showSteps && journey.steps && journey.steps.length > 0) {
                // steps geometry
                features = features.concat(stepFeaturesBuilderService.buildAll(journey.steps));
            } else {
                // no step: use journey geometry
                if (journey.geo.geometry) {
                    var feature = build(journey);
                    features.push(feature);
                }
            }

            if (journey.geo.cityFrom) {
                var feature = interestsMarkerBuilderService.buildDeparture(journey.geo.cityFrom);
                features.push(feature);
            }

            if (journey.geo.cityTo) {
                var feature = interestsMarkerBuilderService.buildArrival(journey.geo.cityTo);
                features.push(feature);
            }

            if (options.waypoints && journey.geo.waypoints) {
                features = features.concat(waypointsMarkerBuilderService.buildAll(journey.geo.waypoints));
            }

            return features;
        }

        function build(journey, events) {

            if (!journey || !journey.geo || !journey.geo.geometry) {
                return null;
            }

            var color;
            switch (journey.properties.difficulty) {
            case 1:
                color = '#00ac75';
                break;
            case 2:
                color = '#ff723e';
                break;
            case 3:
                color = '#ac0028';
                break;
            default:
                color = '#00ac75';
                break;
            }

            var feature = {
                type: journey.geo.geometry.type,
                geometry: journey.geo.geometry,
                properties: {
                    options: {
                        label: journey.properties.title,
                        style: {
                            color: color,
                            opacity: 1,
                            weight: 6
                        },
                        selected: journey.selected
                    }
                }
            };

            if (events) {
                feature.properties.events = events
            };
            feature.model = {
                type: 'journey',
                journey: journey
            }

            return feature;
        }

        function buildAll(journeys, events) {

            if (!journeys) {
                features = [];
            }
            var features = journeys.reduce(function (features, journey) {
                var feature = build(journey, events);

                if (feature !== null) {
                    features.push(feature);
                }
                return features;
            }, []);

            return features;
        }
    }
})();