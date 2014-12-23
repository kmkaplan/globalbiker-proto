(function () {

    'use strict';

    angular.module('globalbikerWebApp').factory('interestsMarkerBuilderService', interestsMarkerBuilderService);

    function interestsMarkerBuilderService() {

        var service = {
            build: build
        };

        return service;

        function build(interests, events) {

            if (!interests) {
                interests = [];
            }
            var features = interests.reduce(function (features, interest) {
                var feature = {
                    type: 'Point',
                    geometry: interest.geometry,
                    properties: {
                        prefix: 'glyphicon',
                        icon: 'question-sign',
                        markerColor: 'black'
                    },
                    label: interest.name
                }

                switch (interest.type) {
                case 'interest':
                    feature.properties.awesomeIcon = {
                        prefix: 'glyphicon',
                        icon: 'eye-open',
                        markerColor: 'green'
                    };
                    break;
                case 'water-point':
                    feature.properties.awesomeIcon = {
                        prefix: 'glyphicon',
                        icon: 'ok',
                        markerColor: 'blue'
                    };
                    break;
                case 'bike-shops':
                    feature.properties.awesomeIcon = {
                        prefix: 'glyphicon',
                        icon: 'wrench',
                        markerColor: 'pink'
                    };
                    break;
                case 'food':
                    feature.properties.awesomeIcon = {
                        prefix: 'glyphicon',
                        icon: 'cutlery',
                        markerColor: 'black'
                    };
                    break;
                case 'danger':
                    feature.properties.awesomeIcon = {
                        prefix: 'fa',
                        icon: 'exclamation-triangle',
                        markerColor: 'red'
                    };
                    break;
                default:
                    console.warn('Unknown type "%s" for interest %s.', interest.type, interest._id);
                    break;
                }
                if (events) {
                    feature.properties.events = events
                };
                feature.model = {
                    type: 'interest',
                    interest: interest
                }
                feature.properties.label = interest.name;
                features.push(feature);
                return features;
            }, []);

            return features;
        }
    }
})();