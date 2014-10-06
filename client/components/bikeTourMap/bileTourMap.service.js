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

                    var feature = self._buildFeature(item, options);

                    if (feature !== null) {
                        features.push(feature);
                    }

                    return features;

                }, []);

                return features;
            },
            buildStepTraceFeature: function (step, options) {

                var style = _.merge({
                    color: '#236d15',
                    opacity: 0.6,
                    weight: 12
                }, options);

                if (!step.geometry) {
                    step.geometry = {
                        type: 'LineString',
                        coordinates: [[step.cityFrom.longitude, step.cityFrom.latitude], [step.cityTo.longitude, step.cityTo.latitude]]
                    };
                    style.dashArray = '20 15';
                }

                var overStyle = angular.copy(style);
                overStyle.opacity = 1;
                overStyle.weight = 20;

                var stepFeature = this._buildFeature(step, {
                    style: function () {
                        return style;
                    },
                    onEachFeature: function (feature, layer) {
                        layer.on({
                            mouseover: function () {
                                layer.setStyle(overStyle);
                            },
                            mouseout: function () {
                                layer.setStyle(style);
                            },
                            click: function () {

                                if (typeof (options.callbacks) !== 'undefined' && typeof (options.callbacks['click']) === 'function') {
                                    options.callbacks['click'](step);
                                }
                            }
                        });
                    }
                });
                
                stepFeature.properties.animate= true;
                    

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
            buildToursStepTracesFeatures: function (tours, options) {
                var self = this;
                var stepTraceFeatures = tours.reduce(function (stepTraceFeatures, tour) {

                    var tourOptions = angular.copy(options);

                    if (!tourOptions.color) {
                        if (tour.color) {
                            tourOptions.color = tour.color;
                        } else {
                            tourOptions.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
                        }
                    }

                    if (tour.steps) {

                        tour.steps.reduce(function (stepTraceFeatures, step) {

                            var feature = self.buildStepTraceFeature(step, tourOptions);
                            if (feature) {
                                stepTraceFeatures.push(feature);
                            }
                            return stepTraceFeatures;
                        }, stepTraceFeatures);
                    }

                    return stepTraceFeatures;
                }, []);

                return stepTraceFeatures;
            },
            buildInterestsFeatures: function (interests, options) {

                if (!options) {
                    options = {};
                }
                if (!options.mode) {
                    options.mode = 'light';
                }
                if (options.mode == 'light') {
                    var geojsonMarkerOptions = {
                        radius: 3,
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
                                options.color = '#5282ed';
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

                } else {
                    return this._buildFeatures(interests, function (interest) {


                        return {
                            pointToLayer: function (feature, latlng) {

                                var iconOptions = {};

                                switch (interest.type) {
                                case 'interest':
                                    iconOptions = {
                                        prefix: 'glyphicon',
                                        icon: 'eye-open',
                                        markerColor: 'green'
                                    };
                                    break;
                                case 'bike-shops':
                                    iconOptions = {
                                        prefix: 'glyphicon',
                                        icon: 'wrench',
                                        markerColor: 'pink'
                                    };
                                    break;
                                case 'food':
                                    iconOptions = {
                                        prefix: 'glyphicon',
                                        icon: 'cutlery',
                                        markerColor: 'black'
                                    };
                                    break;
                                case 'danger':
                                    iconOptions = {
                                        prefix: 'fa',
                                        icon: 'exclamation-triangle',
                                        markerColor: 'red'
                                    };
                                    break;
                                default:
                                    iconOptions = {
                                        prefix: 'glyphicon',
                                        icon: 'question-sign',
                                        markerColor: 'black'
                                    };
                                    console.warn('Unknown type %s for interest %s.', interest.type, interest._id);
                                    break;
                                }

                                // configure the marker
                                var icon = L.AwesomeMarkers.icon(iconOptions);

                                var markerOptions = {
                                    icon: icon
                                };

                                var markerLayer = L.marker(latlng, markerOptions);

                                if (typeof (options.callbacks) !== 'undefined' && typeof (options.callbacks['click']) === 'function') {
                                    markerLayer.on('click', function (e) {
                                        options.callbacks['click'](interest, markerLayer);
                                    });
                                }
                                return markerLayer;
                            }
                        }

                    });
                }

            },
        }

    });