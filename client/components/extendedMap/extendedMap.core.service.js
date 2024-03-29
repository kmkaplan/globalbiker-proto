'use strict';

angular.module('globalbikerWebApp')
    .service('extendedMapCoreService', function () {
        // AngularJS will instantiate a singleton by calling "new" on this function

        return {
            removeItem: function (eMap, layerOptions, item) {
                if (!item.layer) {
                    console.warn('Item has no layer.');
                    return;
                }

                // remove it from the layer
                this.removeFromLayer(eMap, layerOptions, item);

            },
            drawItem: function (eMap, layerOptions, item) {

                var thisService = this;

                if (!item.extendedMapId) {
                    // new marker: generate an internal id
                    item.extendedMapId = this._getRandomId();

                    // TODO is it possible to use internal _leafletId_ instead? (unique for map or for layerGroup?)
                }

                var itemLayer;

                switch (item.type.toLowerCase()) {
                case 'marker':
                    itemLayer = this.drawMarker(eMap, layerOptions, item);
                    break;
                case 'polyline':
                    itemLayer = this.drawPolyline(eMap, layerOptions, item);
                    break;
                case 'image':
                    itemLayer = this.drawImage(eMap, layerOptions, item);
                    break;
                case 'feature':
                    itemLayer = this.drawFeature(eMap, layerOptions, item);
                    break;
                default:
                    console.error('Unknown type %s.', item.type);
                    return;
                    break;
                }

                if (typeof (item.callbacks) !== 'undefined' && typeof (item.callbacks['click']) === 'function') {
                    itemLayer.on('click', function (e) {
                        item.callbacks['click'](eMap, item, itemLayer, e);
                    });
                }

            },
            _getRandomId: function () {
                // TODO store the id to be sure to never generate twice the same
                return Math.floor((Math.random() * 6) + 1);
            },
            drawFeature: function (eMap, layerOptions, feature) {
                var map = eMap.map;

                // check input parameters
                if (!feature.geometry) {
                    console.error('Feature geometry is not defined.');
                    return;
                }
                if (!feature.properties) {
                    console.warn('Feature properties is not defined.');
                    feature.properties = {};
                }

                if (!feature.properties.options) {
                    feature.properties.options = {};
                }

                var featureLayer = L.geoJson(feature, feature.properties.options);

                // add it to the layer
                this.addToLayer(eMap, layerOptions, featureLayer, feature);

                var polylineLayer = featureLayer.getLayers()[0];

                if (feature.properties.animate) {
                    // this._animate(polylineLayer);
                }

                return featureLayer;
            },
            drawMarker: function (eMap, layerOptions, marker) {
                var map = eMap.map;

                // check input parameters
                if (!marker.latitude) {
                    console.error('Marker latitude is not defined.');
                    return;
                }
                if (!marker.longitude) {
                    console.error('Marker longitude is not defined.');
                    return;
                }

                var markerOptions = {};

                if (marker.icon) {

                    var iconOptions = {};

                    if (marker.icon.name) {
                        if (marker.icon.name.indexOf('fa-') === 0) {
                            iconOptions.prefix = 'fa';
                            iconOptions.icon = marker.icon.name.substr('fa'.length + 1);
                        } else {
                            iconOptions.prefix = 'glyphicon';
                            iconOptions.icon = marker.icon.name.substr('glyphicon'.length + 1);
                        }
                    }
                    angular.extend(iconOptions, marker.icon);

                    // configure the marker
                    var markerIcon = L.AwesomeMarkers.icon(iconOptions);
                    markerOptions.icon = markerIcon;

                }

                if (marker.opacity) {
                    markerOptions.opacity = marker.opacity;
                }

                var markerLayer = L.marker([marker.latitude, marker.longitude], markerOptions); //.addTo(map);

                if (marker.popup && marker.popup.content) {
                    markerLayer.bindPopup(marker.popup.content);
                    if (marker.popup.open) {
                        markerLayer.openPopup();
                    }
                }

                // add it to the layer
                this.addToLayer(eMap, layerOptions, markerLayer, marker);

                return markerLayer;
            },
            drawImage: function (eMap, layerOptions, image) {
                var map = eMap.map;

                // check input parameters
                if (!image.latitude) {
                    console.error('Image latitude is not defined.');
                    return;
                }
                if (!image.longitude) {
                    console.error('Image longitude is not defined.');
                    return;
                }

                var imageBounds = [[image.latitude, image.longitude], [image.latitude, image.longitude]];

                var options = {};

                if (image.opacity) {
                    options.opacity = image.opacity;
                };

                // create image layer
                var imageLayer = L.fixedImage(image.url, imageBounds, options);

                // add it to the parent layer
                this.addToLayer(eMap, layerOptions, imageLayer, image);

                return imageLayer;
            },

            drawPolyline: function (eMap, layerOptions, polyline) {
                var map = eMap.map;

                // check input parameters
                if (Object.prototype.toString.call(polyline.points) !== '[object Array]') {
                    console.error('Polyline %s points are not defined or not an array.', polyline.extendedMapId);
                    return;
                }

                var latlngs = polyline.points.reduce(function (output, point) {
                    if (!point.latitude) {
                        console.error('Point latitude is not defined for polyline %s.', polyline.extendedMapId);
                        return output;
                    }
                    if (!point.longitude) {
                        console.error('Point longitude is not defined for polyline %s.', polyline.extendedMapId);
                        return output;
                    }
                    output.push(L.latLng(point.latitude, point.longitude));
                    return output;
                }, []);

                if (latlngs.length < 2) {
                    console.error('Only %d valid points for polyline %s.', latlngs.length, polyline.extendedMapId);
                    return;
                }

                var options = {
                    color: 'red'
                };

                if (polyline.color) {
                    options.color = polyline.color;
                }
                if (polyline.weight) {
                    options.weight = polyline.weight;
                }
                if (polyline.opacity) {
                    options.opacity = polyline.opacity;
                }
                if (polyline.dashArray) {
                    options.dashArray = polyline.dashArray;
                }

                // draw the polyline
                var polylineLayer = L.polyline(latlngs, options);

                // add it to the 'draw' layer
                this.addToLayer(eMap, layerOptions, polylineLayer, polyline);

                polylineLayer._path.classList.add('polyline-path');

                return polylineLayer;
            },
            _animate: function (polylineLayer) {
                polylineLayer._path.classList.add('path-start');

                var totalLength = polylineLayer._path.getTotalLength();
                polylineLayer._path.classList.add('path-start');
                // This pair of CSS properties hides the line initially
                // See http://css-tricks.com/svg-line-animation-works/
                // for details on this trick.
                polylineLayer._path.style.strokeDashoffset = totalLength;
                polylineLayer._path.style.strokeDasharray = totalLength;

                setTimeout((function (path) {
                    return function () {
                        // setting the strokeDashoffset to 0 triggers
                        // the animation.
                        path.style.strokeDashoffset = 0;
                    };
                })(polylineLayer._path), 500);
            },

            ensureLayerExists: function (eMap, layerOptions) {
                var map = eMap.map;

                var eLayer = eMap.eLayersMap[layerOptions.name];
                if (!eLayer) {
                    // create layer
                    var layer = new L.LayerGroup();

                    layer.layerOptions = layerOptions;

                    if (layerOptions.show) {
                        map.addLayer(layer);
                    }
                    if (layerOptions.control) {
                        // ensure layer control exists
                        if (!eMap.layerControl) {
                            eMap.layerControl = L.control.layers([], []);
                            eMap.layerControl.addTo(map);
                        }
                        eMap.layerControl.addOverlay(layer, layerOptions.name);
                    }

                    eLayer = {
                        layer: layer,
                        itemsMap: {}
                    };

                    eMap.eLayersMap[layerOptions.name] = eLayer;
                }
                return eLayer;
            },
            addToLayer: function (eMap, layerOptions, childLayer, childItem) {

                if (!childItem) {
                    console.error('Child item has not been set.');
                    return null;
                }

                if (!childItem.extendedMapId) {
                    console.error('Child item extendedMapId has not been set.');
                    return null;
                }

                // retrieve or create the layer by name
                var parentELayer = this.ensureLayerExists(eMap, layerOptions);

                // add the item to the parent layer
                parentELayer.layer.addLayer(childLayer);

                // store the parent eLayer in the child layer
                childLayer.parentELayer = parentELayer;
                childLayer.item = childItem;
                childItem.layer = childLayer;

                parentELayer.itemsMap[childItem.extendedMapId] = childItem;

                // return the parent eLayer
                return parentELayer;
            },
            removeFromLayer: function (eMap, layerOptions, childItem) {

                if (!childItem) {
                    console.error('Child item has not been set.');
                    return null;
                }

                if (!childItem.layer) {
                    console.error('Child item layer has not been set.');
                    return null;
                }

                // retrieve or create the layer by name
                var parentELayer = this.ensureLayerExists(eMap, layerOptions);

                // remove the item from the parent layer
                parentELayer.layer.removeLayer(childItem.layer);

                // remove the associated parent layer
                delete childItem.layer.parentELayer;

                // remove the associated layer
                delete childItem.layer;

                // remove from cache
                delete parentELayer.itemsMap[childItem.extendedMapId];

                // return the eMap
                return eMap;
            }
        };

    });