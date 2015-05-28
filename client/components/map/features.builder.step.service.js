(function () {

    'use strict';

    angular.module('globalbikerWebApp').factory('stepFeaturesBuilderService', stepFeaturesBuilderService);

    function stepFeaturesBuilderService() {

        var service = {
            build: build,
            buildAll: buildAll
        };

        return service;

        function getStepLabel(step) {
            if (step.geo && step.geo.cityFrom.name === step.geo.cityTo.name) {
                // same source & destination
                return step.cityFrom.name;
            } else {
                // TODO i18n
                return 'From ' + step.geo.cityFrom.name + ' to ' + step.geo.cityTo.name;
            }
        };

        
        function build(step, events) {
                
            if (!step || !step.geo.geometry || !step.geo.geometry) {
                return null;
            }

            var color;
            switch (step.properties.difficulty) {
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
                color = 'black';
                break;
            }

            var feature = {
                type: step.geo.geometry.type,
                geometry: step.geo.geometry,
                properties: {
                    options: {
                        label: getStepLabel(step),
                        style: {
                            color: color,
                            opacity: 1,
                            weight: 6
                        },
                        selected: step.selected
                    }
                }
            };

            if (events) {
                feature.properties.events = events
            };
            feature.model = {
                type: 'step',
                step: step
            }

            return feature;
        }
        
        function buildAll(steps, events) {
                
            if (!steps) {
                features = [];
            }
            var features = steps.reduce(function (features, step) {
                var feature = build(step, events);
                
                if (feature !== null){
                    features.push(feature);
                }
                return features;
            }, []);

            return features;
        }
    }
})();