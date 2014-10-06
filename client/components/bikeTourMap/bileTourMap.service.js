'use strict';

angular.module('bikeTouringMapApp')
    .service('bikeTourMapService', function () {

        return {
            /*
            / build feature using options
            @see http://leafletjs.com/reference.html#geojson-options
            */
            _buildFeature: function (item, options) {

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

            },

            _buildFeatures: function (items, options) {

                var self = this;

                var features = items.reduce(function (features, item) {

                    var feature = self._buildFeature(item);

                    if (feature !== null) {
                        features.push(feature);
                    }

                    return features;

                }, []);

                return features;
            },
            buildStepTraceFeature: function (step) {
                var stepFeature = this._buildFeature(step);

                return stepFeature;
            },
            buildBikelanesFeatures: function (bikelanes) {
                return this._buildFeatures(bikelanes, {
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
                    radius: 5,
                    fillColor: 'grey',
                    color: 'black',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.3
                };
                return this._buildFeatures(interests, function (interest) {

                    var options = angular.copy(geojsonMarkerOptions);

                    switch (interest.type) {
                    case 'danger':
                        {
                            options.color = '#ff0014';
                            options.fillColor = '#ff0014';
                            break;
                        }
                    case 'water-point':
                        {
                            options.color = '#004dfc';
                            options.fillColor = '#5282ed';
                            break;
                        }
                    case 'interest':
                        {
                            options.color = '#047104';
                            options.fillColor = '##047104';
                            break;
                        }
                    case 'bike-shops':
                        {
                            options.color = '#f51e43';
                            options.fillColor = '#f51e43';
                            break;
                        }
                    case 'food':
                        {
                            options.color = 'black';
                            options.fillColor = 'black';
                            break;
                        }
                    default:
                        console.warn('Unknown type %s for interest %s.', interest.type, interest._id);
                        break;
                    }

                    return {
                        pointToLayer: function (feature, latlng) {
                            return L.circleMarker(latlng, options);
                        }
                    }

                });

                return features;
            },
        }

    });