(function () {

    'use strict';

    angular.module('globalbikerWebApp').service('mapStepTraceBuilder', mapStepTraceBuilder);

    // @FIXME @deprecated use features.builder.step.service

    function mapStepTraceBuilder(mapCoreBuilder, mapCityBuilder) {

        var service = {
            buildStepTraceFeatures: buildStepTraceFeatures,
            buildStepsTracesFeatures: buildStepsTracesFeatures
        };

        return service;

        function buildStepsTracesFeatures(steps, options, tour) {

            var features = [];

            if (steps) {

                var stepsOptions = angular.copy(options);

                if (!stepsOptions.style) {
                    stepsOptions.style = {};
                }

                if (!stepsOptions.style.color) {
                    stepsOptions.style.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
                }

                if (steps) {

                    features = steps.reduce(function (stepTraceFeatures, step) {

                        var features = service.buildStepTraceFeatures(step, stepsOptions, tour);
                        if (features) {
                            stepTraceFeatures = stepTraceFeatures.concat(features);
                        }
                        return stepTraceFeatures;
                    }, []);

                    if (steps && steps.length !== 0 && options.tour && options.tour.bounds.show && options.tour.bounds.show) {
                        var origin = steps[0].cityFrom;
                        var feature = mapCityBuilder.buildOriginMarker(origin);
                        if (feature !== null) {
                            features.push(feature);
                        }

                        var destination = steps[steps.length - 1].cityTo;
                        feature = mapCityBuilder.buildDestinationMarker(destination);
                        if (feature !== null) {
                            features.push(feature);
                        }
                    }

                }

            } else {
                console.warn('No step to display.');
            }
            return features;
        }

        function buildStepTraceFeatures(step, options, tour) {

            if (!options) {
                options = {};
            }
            if (!options.style) {
                options.style = {};
            }


            var style = _.merge({
                color: '#236d15',
                opacity: 0.6,
                weight: 12
            }, options.style);

            if (!step.geometry) {
                step.geometry = {
                    type: 'LineString',
                    coordinates: [step.cityFrom.geometry.coordinates, step.cityTo.geometry.coordinates]
                };
                style.dashArray = '20 15';
            }

            var overStyle;
            if (options.overStyle) {
                overStyle = angular.copy(style);
                angular.extend(overStyle, options.overStyle);
            } else {
                overStyle = null
            }

            var label;
            if (options.label) {
                if (typeof (options.label) === 'function') {
                    label = options.label(step, tour);
                } else {
                    label = options.label;
                }
            }

            var stepFeature = mapCoreBuilder.buildFeature(step, {
                label: label,
                style: function () {
                    return style;
                },
                onEachFeature: function (feature, layer) {
                    layer.on({
                        mouseover: function () {
                            if (overStyle !== null) {
                                layer.setStyle(overStyle);
                            }
                        },
                        mouseout: function () {
                            if (overStyle !== null) {
                                layer.setStyle(style);
                            }
                        },
                        click: function () {

                            if (typeof (options.callbacks) !== 'undefined' && typeof (options.callbacks['click']) === 'function') {
                                options.callbacks['click'](step, tour);
                            }
                        }
                    });
                }
            });

            stepFeature.properties.animate = true;

            var features = [stepFeature];

            if (options.step && options.step.bounds && options.step.bounds.show) {
                var origin = step.cityFrom;
                var feature = mapCityBuilder.buildOriginMarker(origin);

                if (feature !== null) {
                    features.push(feature);
                }

                var destination = step.cityTo;
                feature = mapCityBuilder.buildDestinationMarker(destination);
                if (feature !== null) {
                    features.push(feature);
                }
            }

            return features;
        }
    }

}());