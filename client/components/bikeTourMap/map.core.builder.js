(function () {

    'use strict';

    angular.module('globalbikerWebApp').service('mapCoreBuilder', mapCoreBuilder);

    // @FIXME @deprecated use features.builder.*.service

    function mapCoreBuilder() {

        var service = {
            buildFeature: buildFeature,
            buildFeatures: buildFeatures
        };

        return service;

        /*
        / build feature using options
        @see http://leafletjs.com/reference.html#geojson-options
        */
        function buildFeature(item, options) {

            if (!item.geometry) {
                console.warn('Item %d has no geometry.', item._id);
                return null;
            }

            var featureOptions;
            if (typeof (options) === 'function') {
                featureOptions = options(item);
            } else {
                featureOptions = options;
            }

            var feature = {
                'type': 'Feature',
                'properties': {
                    options: featureOptions,
                    model: item
                },
                'geometry': item.geometry
            };
            return feature;

        }

        function buildFeatures(items, options) {

            var features = items.reduce(function (features, item) {

                var feature = service.buildFeature(item, options);

                if (feature !== null) {
                    features.push(feature);
                }

                return features;

            }, []);

            return features;
        }
    }


}());