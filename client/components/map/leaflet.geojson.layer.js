/*
 * Custom Geojson featureGroupe layer.
 *
 * @see https://github.com/Leaflet/Leaflet/blob/v0.7.3/src/layer/FeatureGroup.js
 * @see https://github.com/Leaflet/Leaflet/blob/v0.7.3/src/layer/LayerGroup.js
 */

L.GeojsonItem = L.FeatureGroup.extend({

    initialize: function (item) {

        this._layers = {};

        if (item) {
            this.addData(item);
        }
    },

    addData: function (item) {

        var features = L.Util.isArray(item) ? item : item.features,
            i, len, feature;

        if (features) {
            for (i = 0, len = features.length; i < len; i++) {
                // Only add this if geometry or geometries are set and not null
                feature = features[i];
                if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
                    this.addData(features[i]);
                }
            }
            return this;
        }

        this.createLayer(item);
    },

    createLayer: function (item) {

        // console.log('Create layer for item:', item);

        if (!item.properties.options) {
            item.properties.options = {};
        }

        var layer;

        var coordsToLatLng = this.coordsToLatLng;

        switch (item.geometry.type) {

        case 'Point':
            var latlng = coordsToLatLng(item.geometry.coordinates);

            var markerOptions = {
                riseOnHover: true
            };

            if (item.properties.circle) {

                markerOptions = {
                    radius: 5,
                    fillColor: 'grey',
                    color: 'black',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.3
                };

                angular.extend(markerOptions, item.properties.circle);

                // circle marker
                layer = L.circleMarker(latlng, markerOptions);
            } else {
                // classic marker
                if (item.properties.awesomeIcon) {
                    // marker with icon
                    markerOptions.icon = L.AwesomeMarkers.icon(item.properties.awesomeIcon);
                }

                layer = new L.Marker(latlng, markerOptions);
            }

            if (item.properties.label) {
                // bind label
                layer.bindLabel(item.properties.label);
            }

            if (item.properties.events) {
                // register events
                for (var eventKey in item.properties.events) {
                    if (item.properties.events.hasOwnProperty(eventKey)) {

                        layer.on(eventKey, function (event) {
                            item.properties.events[eventKey](item, event);
                        });
                    }
                }

            }
            this._addToLayer(item, layer, true);

            break;

        case 'LineString':
            var latlngs = this.coordsToLatLngs(item.geometry.coordinates, 0, coordsToLatLng);

            // http://leafletjs.com/reference.html#polyline-options 
            var polylineOptions;

            if (item.properties.options.style) {
                if (typeof (item.properties.options.style) === 'function') {
                    polylineOptions = item.properties.options.style(item);
                } else {
                    polylineOptions = item.properties.options.style;
                }
            } else {
                polylineOptions = {}
            }

            //  add foreground layer
            layer = new L.Polyline(latlngs, polylineOptions);

            this._addToLayer(item, layer, false);

            // add transparent layer
            polylineOptions.color = 'transparent';
            polylineOptions.weight = 20;

            layer = new L.Polyline(latlngs, polylineOptions);

            if (item.properties.options.label) {
                layer.bindLabel(item.properties.options.label);
            }

            this._addToLayer(item, layer, true);

            break;

        case 'MultiLineString':

            var latlngs = this.coordsToLatLngs(item.geometry.coordinates, 1, coordsToLatLng);

            // http://leafletjs.com/reference.html#polyline-options 
            var polylineOptions;

            if (item.properties.options.style) {
                if (typeof (item.properties.options.style) === 'function') {
                    polylineOptions = item.properties.options.style(item);
                } else {
                    polylineOptions = item.properties.options.style;
                }
            } else {
                polylineOptions = {}
            }

            //  add main layer
            var layer1 = new L.MultiPolyline(latlngs, polylineOptions);

            this._addToLayer(item, layer1, false);

            if (item.properties.events) {

                if (typeof (item.properties.events.click) === 'function') {
                    this._addMultipolylineHoverEffect(item, latlngs, polylineOptions);
                }
                // register events
                for (var eventKey in item.properties.events) {
                    if (item.properties.events.hasOwnProperty(eventKey)) {

                        layer2.on(eventKey, function (event) {
                            item.properties.events[eventKey](item, event);
                        });
                    }
                }
            }

            break;

        default:
            console.error('Invalid geometry type "%s".', item.geometry.type);
            throw new Error('Invalid geometry type.');
        }

    },

    _addMultipolylineHoverEffect: function (item, latlngs, polylineOptions) {
        // add transparent layer
        var transparentPolylineOptions = angular.copy(polylineOptions);
        transparentPolylineOptions.color = 'transparent';
        transparentPolylineOptions.weight = 20;

        var layer2 = new L.MultiPolyline(latlngs, transparentPolylineOptions);
        if (item.properties.options.label) {
            layer2.bindLabel(item.properties.options.label);
        }

        this._addToLayer(item, layer2, true);

        var polylineOptionsOnOver = angular.copy(transparentPolylineOptions);
        polylineOptionsOnOver.color = polylineOptions.color;
        polylineOptionsOnOver.opacity = 0.2;

        layer2.on('mouseover', function () {
            if (polylineOptionsOnOver !== null) {
                layer2.setStyle(polylineOptionsOnOver);
            }
        });
        layer2.on('mouseout', function () {
            if (polylineOptionsOnOver !== null) {
                layer2.setStyle(transparentPolylineOptions);
            }
        });

        if (item && item.model && item.model.tour && item.model.tour.selected) {
            layer2.setStyle(polylineOptionsOnOver);
        }
    },

    _addToLayer: function (item, layer, applyOnEachFeature) {
        layer.feature = this.asFeature(item);

        layer.defaultOptions = layer.options;

        if (applyOnEachFeature && item.properties.options.onEachFeature) {
            item.properties.options.onEachFeature(item, layer);
        }

        return this.addLayer(layer);
    },

    coordsToLatLng: function (coords) { // (Array[, Boolean]) -> LatLng
        return new L.LatLng(coords[1], coords[0], coords[2]);
    },

    coordsToLatLngs: function (coords, levelsDeep, coordsToLatLng) { // (Array[, Number, Function]) -> Array
        var latlng, i, len,
            latlngs = [];

        for (i = 0, len = coords.length; i < len; i++) {
            latlng = levelsDeep ?
                this.coordsToLatLngs(coords[i], levelsDeep - 1, coordsToLatLng) :
                (coordsToLatLng || this.coordsToLatLng)(coords[i]);

            latlngs.push(latlng);
        }

        return latlngs;
    },

    latLngToCoords: function (latlng) {
        var coords = [latlng.lng, latlng.lat];

        if (latlng.alt !== undefined) {
            coords.push(latlng.alt);
        }
        return coords;
    },

    latLngsToCoords: function (latLngs) {
        var coords = [];

        for (var i = 0, len = latLngs.length; i < len; i++) {
            coords.push(L.GeojsonItem.latLngToCoords(latLngs[i]));
        }

        return coords;
    },

    getFeature: function (layer, newGeometry) {
        return layer.feature ? L.extend({}, layer.feature, {
            geometry: newGeometry
        }) : L.GeojsonItem.asFeature(newGeometry);
    },

    asFeature: function (geoJSON) {
        if (geoJSON.type === 'Feature') {
            return geoJSON;
        }

        return {
            type: 'Feature',
            properties: {},
            geometry: geoJSON
        };
    }
});

/*
var PointToGeoJSON = {
    toGeoJSON: function () {
        return L.GeojsonItem.getFeature(this, {
            type: 'Point',
            coordinates: L.GeojsonItem.latLngToCoords(this.getLatLng())
        });
    }
};

L.Marker.include(PointToGeoJSON);
L.Circle.include(PointToGeoJSON);
L.CircleMarker.include(PointToGeoJSON);

L.Polyline.include({
    toGeoJSON: function () {
        return L.GeojsonItem.getFeature(this, {
            type: 'LineString',
            coordinates: L.GeojsonItem.latLngsToCoords(this.getLatLngs())
        });
    }
});


L.Polygon.include({
    toGeoJSON: function () {
        var coords = [L.GeojsonItem.latLngsToCoords(this.getLatLngs())],
            i, len, hole;

        coords[0].push(coords[0][0]);

        if (this._holes) {
            for (i = 0, len = this._holes.length; i < len; i++) {
                hole = L.GeojsonItem.latLngsToCoords(this._holes[i]);
                hole.push(hole[0]);
                coords.push(hole);
            }
        }

        return L.GeojsonItem.getFeature(this, {
            type: 'Polygon',
            coordinates: coords
        });
    }
});

(function () {
    function multiToGeoJSON(type) {
        return function () {
            var coords = [];

            this.eachLayer(function (layer) {
                coords.push(layer.toGeoJSON().geometry.coordinates);
            });

            return L.GeojsonItem.getFeature(this, {
                type: type,
                coordinates: coords
            });
        };
    }

    L.MultiPolyline.include({
        toGeoJSON: multiToGeoJSON('MultiLineString')
    });
    L.MultiPolygon.include({
        toGeoJSON: multiToGeoJSON('MultiPolygon')
    });

    L.LayerGroup.include({
        toGeoJSON: function () {

            var geometry = this.feature && this.feature.geometry,
                jsons = [],
                json;

            if (geometry && geometry.type === 'MultiPoint') {
                return multiToGeoJSON('MultiPoint').call(this);
            }

            var isGeometryCollection = geometry && geometry.type === 'GeometryCollection';

            this.eachLayer(function (layer) {
                if (layer.toGeoJSON) {
                    json = layer.toGeoJSON();
                    jsons.push(isGeometryCollection ? json.geometry : L.GeojsonItem.asFeature(json));
                }
            });

            if (isGeometryCollection) {
                return L.GeojsonItem.getFeature(this, {
                    geometries: jsons,
                    type: 'GeometryCollection'
                });
            }

            return {
                type: 'FeatureCollection',
                features: jsons
            };
        }
    });
}());
*/
L.geojsonLayer = function (item) {
    return new L.GeojsonItem(item);
};