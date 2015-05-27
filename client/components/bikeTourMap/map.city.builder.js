(function () {

    'use strict';

    angular.module('globalbikerWebApp').service('mapCityBuilder', mapCityBuilder);

    // @FIXME @deprecated use features.builder.*.service

    function mapCityBuilder(mapCoreBuilder) {

        var service = {
            buildOriginMarker: buildOriginMarker,
            buildDestinationMarker: buildDestinationMarker
        };

        return service;

        function buildOriginMarker(origin) {

            var feature = null;

            // FIXME: remove old map model

            feature = mapCoreBuilder.buildFeature(origin, {
                pointToLayer: function (feature, latlng) {

                    return L.marker(latlng, {
                        icon: L.AwesomeMarkers.icon({
                            prefix: 'fa',
                            icon: 'dot-circle-o ',
                            markerColor: 'black'
                        })
                    }).bindLabel(origin.name);
                }
            });

            // TODO: new map model
            feature.properties.awesomeIcon = {
                prefix: 'fa',
                icon: 'dot-circle-o ',
                markerColor: 'black'
            };
            feature.properties.label = origin.name;

            return feature;
        }

        function buildDestinationMarker(destination) {

            var feature = null;

            // FIXME: remove old map model
            feature = mapCoreBuilder.buildFeature(destination, {
                pointToLayer: function (feature, latlng) {

                    return L.marker(latlng, {
                        icon: L.AwesomeMarkers.icon({
                            prefix: 'fa',
                            icon: 'flag ',
                            markerColor: 'black'
                        })
                    }).bindLabel(destination.name);;
                }
            });

            // TODO: new map model
            feature.properties.awesomeIcon = {
                prefix: 'fa',
                icon: 'flag ',
                markerColor: 'black'
            };
            feature.properties.label = destination.name;

            return feature;
        }
    }


}());