(function () {

    'use strict';

    angular.module('globalbikerWebApp').factory('tourFeaturesBuilderService', tourFeaturesBuilderService);

    function tourFeaturesBuilderService() {

        var service = {
            build: build,
            buildAll: buildAll
        };

        return service;

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