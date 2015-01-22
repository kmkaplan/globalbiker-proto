(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourEditTraceCtrl', TourEditTraceCtrl);

    function TourEditTraceCtrl(tour, $scope, $stateParams, $state, $q, $timeout, Auth, securityService, featuresBuilderFileService) {

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

                            $scope.mapConfig.items = [feature];

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
    }

})();