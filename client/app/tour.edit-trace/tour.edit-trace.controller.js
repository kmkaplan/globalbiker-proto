(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourEditTraceCtrl', TourEditTraceCtrl);

    function TourEditTraceCtrl(tour, $scope, $stateParams, $state, $q, $timeout, Auth, securityService, featuresBuilderFileService, tourFeaturesBuilderService, interestsMarkerBuilderService) {

        // scope properties
        $scope.mapConfig = {};
        $scope.traceFileUpload;
        $scope.tinymceOptions = {
            height: '200px',
            menubar: false,
            toolbar: 'bold italic bullist numlist outdent indent removeformat subscript superscript'
        };

        // scope methods

        // init method
        init();

        function init() {

            if (!tour) {
                $state.go('home');
            } else {
                if (securityService.isTourEditable(tour)) {
                    $scope.tour = tour;
                } else {
                    $state.go('tour.view');
                }
                $scope.mapConfig.bounds = {
                    geometry: tour.region.geometry
                };
                
                showTourOnMap(tour);
            }
        };

        $scope.traceFileUpload = {
            autoUpload: true,
            url: '/api/tours/reference/' + tour.reference + '/upload/trace',
            callbacks: {
                filesSelected: function (files) {
                    for (var i = 0; i < files.length; i++) {

                        var file = files[i];

                        featuresBuilderFileService.build(file).then(function (feature) {

                            $scope.gpsFeature = feature;

                            if ($scope.mapConfig.items){
                                $scope.mapConfig.items = $scope.mapConfig.items.concat([feature]);
                            }else{
                                $scope.mapConfig.items = [feature];
                            }

                            $scope.mapConfig.bounds = {
                                geometry: feature.geometry
                            };

                        });

                    }
                },
                success: function (data) {

                }
            }
        };

        function showTourOnMap(tour) {
            var features = [];

            // no step geometry: display tour geometry instead
            if (tour.geometry) {
                var feature = tourFeaturesBuilderService.build(tour);
                features.push(feature);
            }

            if (tour.cityFrom) {
                var feature = interestsMarkerBuilderService.buildDeparture(tour.cityFrom);
                features.push(feature);
            }

            if (tour.cityTo) {
                var feature = interestsMarkerBuilderService.buildArrival(tour.cityTo);
                features.push(feature);
            }

            if (features.length !== 0) {

                var geometries = features.reduce(function (geometries, feature) {
                    geometries.push(feature.geometry);
                    return geometries;
                }, []);

                $scope.mapConfig.items = features;

                $scope.mapConfig.bounds = {
                    geometry: geometries
                };

            }
        }

    }

})();