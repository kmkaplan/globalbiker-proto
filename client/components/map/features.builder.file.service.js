(function () {

    'use strict';

    angular.module('globalbikerWebApp').factory('featuresBuilderFileService', featuresBuilderFileService);

    function featuresBuilderFileService($q) {

        var service = {
            build: build
        };

        return service;

        function build(file, events) {

            var deffered = $q.defer();

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function (file) {
                return function (e) {
                    // Render thumbnail.
                    var content = e.target.result;

                    var dom = (new DOMParser()).parseFromString(content, 'text/xml');

                    var geojson = toGeoJSON.gpx(dom);
                    
                    var feature = geojson.features[0];

                    deffered.resolve(feature);
                };
            })(file);

            // Read in the image file as a data URL.
            reader.readAsText(file);
            
            return deffered.promise;
        }

    }
})();