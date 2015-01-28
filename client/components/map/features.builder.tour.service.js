(function () {

    'use strict';

    angular.module('globalbikerWebApp').factory('tourFeaturesBuilderService', tourFeaturesBuilderService);

    function tourFeaturesBuilderService() {

        var service = {
            build: build,
            buildSource: buildSource,
            buildAll: buildAll
        };

        return service;

        function buildSource(tour, events) {
                
            if (!tour || !tour.sourceGeometry) {
                return null;
            }

            var color = '#00ac75';

            var feature = {
                type: tour.sourceGeometry.type,
                geometry: tour.sourceGeometry,
                properties: {
                    options: {
                        style: {
                            color: color,
                            opacity: 0.5,
                            weight: 20
                        }
                    }
                }
            };

            if (events) {
                feature.properties.events = events
            };
            feature.model = {
                type: 'tour',
                tour: tour
            }

            return feature;
        }
        
        function build(tour, events) {
                
            if (!tour || !tour.geometry) {
                return null;
            }

            var color;
            switch (tour.difficulty) {
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
                type: tour.geometry.type,
                geometry: tour.geometry,
                properties: {
                    options: {
                        label: tour.title,
                        style: {
                            color: color,
                            opacity: 1,
                            weight: 8
                        },
                        selected: tour.selected
                    }
                }
            };

            if (events) {
                feature.properties.events = events
            };
            feature.model = {
                type: 'tour',
                tour: tour
            }

            return feature;
        }
        
        function buildAll(tours, events) {
                
            if (!tours) {
                features = [];
            }
            var features = tours.reduce(function (features, tour) {
                var feature = build(tour, events);
                
                if (feature !== null){
                    features.push(feature);
                }
                return features;
            }, []);

            return features;
        }
    }
})();