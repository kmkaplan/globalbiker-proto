(function () {

    'use strict';

    angular.module('globalbikerWebApp').factory('tourFeaturesBuilderService', tourFeaturesBuilderService);

    function tourFeaturesBuilderService() {

        var service = {
            build: build
        };

        return service;

        function build(tours, events) {

            if (!tours) {
                features = [];
            }
            var features = tours.reduce(function (features, tour) {

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
                case 1:
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
                            }
                        }
                    },
                };

                if (events) {
                    feature.properties.events = events
                };
                feature.model = {
                    type: 'tour',
                    tour: tour
                }
                features.push(feature);
                return features;
            }, []);

            return features;
        }
    }
})();