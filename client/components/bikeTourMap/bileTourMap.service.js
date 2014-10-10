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
            buildStepTraceFeature: function (step, options, tour) {

                if (!options) {
                    options = {};
                }
                if (!options.style) {
                    options.style = {};
                }


                var style = _.merge({
                    color: '#236d15',
                    opacity: 0.6,
                    weight: 12
                }, options.style);

                if (!step.geometry) {
                    step.geometry = {
                        type: 'LineString',
                        coordinates: [[step.cityFrom.longitude, step.cityFrom.latitude], [step.cityTo.longitude, step.cityTo.latitude]]
                    };
                    style.dashArray = '20 15';
                }

                var overStyle;
                if (options.overStyle) {
                    overStyle = angular.copy(style);
                    angular.extend(overStyle, options.overStyle);
                } else {
                    overStyle = null
                }
                
                var label;
                if (options.label){
                    if (typeof(options.label) === 'function'){
                        label = options.label(step, tour);
                    }else{
                        label = options.label;
                    }
                }
                
                var stepFeature = this._buildFeature(step, {
                    label: label,
                    style: function () {
                        return style;
                    },
                    onEachFeature: function (feature, layer) {
                        layer.on({
                            mouseover: function () {
                                if (overStyle !== null) {
                                    layer.setStyle(overStyle);
                                }
                            },
                            mouseout: function () {
                                if (overStyle !== null) {
                                    layer.setStyle(style);
                                }
                            },
                            click: function () {

                                if (typeof (options.callbacks) !== 'undefined' && typeof (options.callbacks['click']) === 'function') {
                                    options.callbacks['click'](step);
                                }
                            }
                        });
                    }
                });

                stepFeature.properties.animate = true;


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
            buildStepsTracesFeatures: function (steps, options, tour) {
                var self = this;

                if (steps) {

                    var stepsOptions = angular.copy(options);

                    if (!stepsOptions.style) {
                        stepsOptions.style = {};
                    }

                    if (!stepsOptions.style.color) {
                        stepsOptions.style.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
                    }

                    if (steps) {

                        return steps.reduce(function (stepTraceFeatures, step) {

                            var feature = self.buildStepTraceFeature(step, stepsOptions, tour);
                            if (feature) {
                                stepTraceFeatures.push(feature);
                            }
                            return stepTraceFeatures;
                        }, []);
                    }
                }

                return [];

            },
            buildToursStepTracesFeatures: function (tours, options) {
                var self = this;
                var stepTraceFeatures = tours.reduce(function (stepTraceFeatures, tour) {

                    var traceOptions;
                    if (!options) {
                        traceOptions = {};
                    } else {
                        traceOptions = angular.copy(options);
                    }

                    if (!traceOptions.style) {
                        traceOptions.style = {};
                    }

                    if (!traceOptions.style.color && tour.color) {
                        traceOptions.style.color = tour.color;
                    }

                    stepTraceFeatures = stepTraceFeatures.concat(self.buildStepsTracesFeatures(tour.steps, traceOptions, tour));

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
                if (options.mode === 'light') {
                    var geojsonMarkerOptions = {
                        radius: 5,
                        fillColor: 'grey',
                        color: 'black',
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.3
                    };
                    return this._buildFeatures(interests, function (interest) {

                        var circleOptions = angular.copy(geojsonMarkerOptions);

                        switch (interest.type) {
                        case 'danger':
                            {
                                circleOptions.color = '#ff0014';
                                circleOptions.fillColor = '#ff0014';
                                break;
                            }
                        case 'merimee':
                            {
                                circleOptions.color = '#7b188d';
                                circleOptions.fillColor = '#7b188d';
                                break;
                            }
                        case 'water-point':
                            {
                                circleOptions.color = '#5282ed';
                                circleOptions.fillColor = '#5282ed';
                                break;
                            }
                        case 'wc':
                            {
                                circleOptions.color = '#7c869b';
                                circleOptions.fillColor = '#7c869b';
                                break;
                            }
                        case 'velotoulouse':
                            {
                                circleOptions.color = '#ff6c00';
                                circleOptions.fillColor = '#ff6c00';
                                break;
                            }
                        case 'interest':
                            {
                                circleOptions.color = '#047104';
                                circleOptions.fillColor = '##047104';
                                break;
                            }
                        case 'bike-shops':
                            {
                                circleOptions.color = '#f51e43';
                                circleOptions.fillColor = '#f51e43';
                                break;
                            }
                        case 'food':
                            {
                                circleOptions.color = 'black';
                                circleOptions.fillColor = 'black';
                                break;
                            }
                        default:
                            console.warn('Unknown type "%s" for interest %s.', interest.type, interest._id);
                            break;
                        }

                        angular.extend(circleOptions, options);

                        return {
                            pointToLayer: function (feature, latlng) {
                                return L.circleMarker(latlng, circleOptions).bindLabel(interest.name);
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
                                case 'water-point':
                                    iconOptions = {
                                        prefix: 'glyphicon',
                                        icon: 'ok',
                                        markerColor: 'blue'
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
                                    console.warn('Unknown type "%s" for interest %s.', interest.type, interest._id);
                                    break;
                                }

                                // configure the marker
                                var icon = L.AwesomeMarkers.icon(iconOptions);

                                var markerOptions = {
                                    icon: icon
                                };

                                var markerLayer = L.marker(latlng, markerOptions).bindLabel(interest.name);;

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