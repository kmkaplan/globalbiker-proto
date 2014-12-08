'use strict';

angular.module('globalbikerWebApp')
    .service('mapCreationService', function (extendedMapMathsService) {
        // AngularJS will instantiate a singleton by calling "new" on this function

        return {

            create: function (element, config) {

                var map = L.map(element, {});

                L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg', {}).addTo(map);

                return map;
            },
            fitBounds: function (map, bounds) {
                if (bounds && bounds.geometry) {
                    
                    console.log('Fit bounds to geometry: ', bounds.geometry);
                    
                    var bounds = extendedMapMathsService.getBoundsFromGeometry(bounds.geometry, 0.1);
                    map.fitBounds(bounds);
                    // FIXME does not work :
                    map.setMaxBounds(bounds);
                }
            }
        }

    });