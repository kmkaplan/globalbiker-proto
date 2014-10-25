/* global io */
'use strict';

angular.module('globalbikerWebApp')
    .factory('GeoConverter', function () {

        return {
            projections: {
                'EPSG:3943': '+proj=lcc +lat_1=42.25 +lat_2=43.75 +lat_0=43 +lon_0=3 +x_0=1700000 +y_0=2200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
            },

            toLatLng: function (points) {

                var converter = proj4(this.projections['EPSG:3943']);

                var convertedPoints = points.reduce(function (output, p) {

                    var transformed = converter.inverse([p.longitude, p.latitude]);

                    output.push({
                        latitude: transformed[1],
                        longitude: transformed[0]
                    });
                    return output;

                }, []);
                return convertedPoints;
            }
        };

    });