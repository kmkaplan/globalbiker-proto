(function () {

    'use strict';

    angular.module('globalbikerWebApp').factory('interestsMarkerBuilderService', interestsMarkerBuilderService);

    function interestsMarkerBuilderService() {

        var service = {
            build: build,
            buildDeparture: buildDeparture,
            buildArrival: buildArrival
        };

        return service;

        function buildDeparture(city) {
            var feature = {
                type: 'Point',
                geometry: city.geometry,
                properties: {
                    awesomeIcon: {
                        prefix: 'fa',
                        icon: 'dot-circle-o',
                        markerColor: 'black'
                    },
                    label: city.name
                }
            };
            return feature;
        }

        function buildArrival(city) {
            var feature = {
                type: 'Point',
                geometry: city.geometry,
                properties: {
                    awesomeIcon: {
                        prefix: 'fa',
                        icon: 'flag',
                        markerColor: 'black'
                    },
                    label: city.name
                }
            };
            return feature;
        }

        function build(interests, events) {

            if (!interests) {
                features = [];
            }
            var features = interests.reduce(function (features, interest) {

                var feature = {
                    type: 'Point',
                    geometry: interest.geometry,
                    properties: {
                        awesomeIcon: {
                            prefix: 'glyphicon',
                            icon: 'question-sign',
                            markerColor: 'black'
                        },
                        label: interest.name
                    },

                }

                switch (interest.type) {

                case 'danger':
                    feature.properties.awesomeIcon = {
                        prefix: 'fa',
                        icon: 'exclamation-triangle',
                        markerColor: 'red'
                    };
                    break;
                case 'information':
                    feature.properties.awesomeIcon = {
                        prefix: 'icon',
                        icon: 'interest-information',
                        markerColor: 'blue'
                    };
                    break;
                case 'water-point':
                    feature.properties.awesomeIcon = {
                        prefix: 'fa',
                        icon: 'glass',
                        markerColor: 'blue'
                    };
                    break;
                case 'wc':
                    feature.properties.awesomeIcon = {
                        prefix: 'fa',
                        icon: 'home',
                        markerColor: 'blue'
                    };
                    break;
                case 'bike-shops':
                    feature.properties.awesomeIcon = {
                        prefix: 'glyphicon',
                        icon: 'wrench',
                        markerColor: 'blue'
                    };
                    break;
                case 'interest':
                    feature.properties.awesomeIcon = {
                        prefix: 'glyphicon',
                        icon: 'eye-open',
                        markerColor: 'green'
                    };
                    break;
                case 'hobbies':
                    feature.properties.awesomeIcon = {
                        prefix: 'icon',
                        icon: 'interest-hobbies',
                        markerColor: 'green'
                    };
                    break;
                case 'accomodation':
                    feature.properties.awesomeIcon = {
                        prefix: 'icon',
                        icon: 'interest-accomodation',
                        markerColor: 'orange'
                    };
                    break;
                case 'food':
                    feature.properties.awesomeIcon = {
                        prefix: 'glyphicon',
                        icon: 'cutlery',
                        markerColor: 'orange'
                    };
                    break;
                case 'velotoulouse':
                    feature.properties.circle = {
                        color: '#ff0014',
                        fillColor: '#ff0014'
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
                features.push(feature);
                return features;
            }, []);

            return features;
        }
    }
})();