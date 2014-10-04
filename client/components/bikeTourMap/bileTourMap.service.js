'use strict';

angular.module('bikeTouringMapApp')
    .service('bikeTourMapService', function () {

        return {
            /*
            / build features using options
            @see http://leafletjs.com/reference.html#geojson-options
            */
            _buildFeature: function (items, options) {

                var features = items.reduce(function (features, item) {

                    features.push({
                        "type": "Feature",
                        "properties": {
                            options: options,
                            model: item
                        },
                        "geometry": item.geometry
                    });
                    return features;

                }, []);

                return features;
            },

            buildBikelanesFeatures: function (bikelanes) {
                return this._buildFeature(bikelanes, {
                    style: function () {
                        return {
                            color: '#236d15',
                            opacity: 0.3
                        };
                    }
                });
            },
            buildInterestsFeatures: function (interests) {
                var geojsonMarkerOptions = {
                    radius: 3,
                    fillColor: "#009dff",
                    color: "#004dfc",
                    weight: 1,
                    opacity: 0.3,
                    fillOpacity: 0.1
                };
                return this._buildFeature(interests, {
                    pointToLayer: function (feature, latlng) {
                        return L.circleMarker(latlng, geojsonMarkerOptions);
                    }
                });

                return features;
            },
        }

    });