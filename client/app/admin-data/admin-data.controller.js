(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('AdminDataCtrl', AdminDataCtrl);


    function AdminDataCtrl($scope, $upload, InterestRepository, BikelaneRepository, interestsMarkerBuilderService) {

        var lngMin = -4.5;
        var lngMax = 8;
        var latMin = 43;
        var latMax = 50.5;

        $scope.provenceMapConfig = {
            items: [],
            bounds: {
                geometry: {
                    "type": "Polygon",
                    "coordinates": [[[lngMin, latMax], [lngMax, latMax], [lngMax, latMin], [lngMin, latMin], [lngMin, latMax]]]
                }
            }
        };

        // Liste des restaurants gastronomiques
        // http://dataprovence.cloudapp.net/DataBrowser/dataprovencetourisme/RestaurantsGastronomiques#param=--DataView--Results
        $scope.dataProvence1 = {
            url: '/api/interests/upload/dataProvence1',
            autoUpload: true,
            callbacks: {
                success: function (data) {
                    loadProvenceMap();
                }
            }
        };
        $scope.dataProvence2 = {
            url: '/api/interests/upload/dataProvence2',
            autoUpload: true,
            callbacks: {
                success: function (data) {
                    loadProvenceMap();
                }
            }
        };
        $scope.dataProvence3 = {
            url: '/api/interests/upload/dataProvence3',
            autoUpload: true,
            callbacks: {
                success: function (data) {
                    loadProvenceMap();
                }
            }
        };

        init();

        function init() {
            loadProvenceMap();
        }

        function loadProvenceMap() {

            InterestRepository.query({
                    type: 'food',
                    source: 'upload'
                },
                function (interests) {
                    var features = interestsMarkerBuilderService.build(interests);

                    if (features) {
                        $scope.provenceMapConfig.items = $scope.provenceMapConfig.items.concat(features);
                    }
                }, function () {

                });

            InterestRepository.query({
                    type: 'accomodation',
                    source: 'upload'
                },
                function (interests) {
                    var features = interestsMarkerBuilderService.build(interests);

                    if (features) {
                        $scope.provenceMapConfig.items = $scope.provenceMapConfig.items.concat(features);
                    }
                }, function () {

                });
        }

        $scope.bikemapFileupload = {
            url: '/api/bikelanes/upload',
            autoUpload: true,
            callbacks: {
                success: function (data) {
                    $scope.loadBikelanes();
                }
            }
        };

        $scope.waterpointsUpload = {
            url: '/api/interests/upload/water-point',
            autoUpload: true,
            callbacks: {
                success: function (data) {
                    $scope.loadPointsOfInterests();
                }
            }
        };

        $scope.velotoulouseUpload = {
            url: '/api/interests/upload/velotoulouse',
            autoUpload: true,
            callbacks: {
                success: function (data) {
                    $scope.loadPointsOfInterests();
                }
            }
        };

        $scope.dangersCarrefoursUpload = {
            url: '/api/interests/upload/danger',
            autoUpload: true,
            callbacks: {
                success: function (data) {
                    $scope.loadPointsOfInterests();
                }
            }
        };

        $scope.merimeeUpload = {
            url: '/api/interests/upload/merimee',
            autoUpload: true,
            callbacks: {
                success: function (data) {
                    $scope.loadPointsOfInterests();
                }
            }
        };

        $scope.wcUpload = {
            url: '/api/interests/upload/wc',
            autoUpload: true,
            callbacks: {
                success: function (data) {
                    $scope.loadPointsOfInterests();
                }
            }
        };


        $scope.init = function () {



        };

        $scope.loadBikelanes = function () {
            $scope.loadingInProgress = true;
            BikelaneRepository.search({
                latitude: 43.61,
                longitude: 1.44,
                maxDistance: 4000
            }, function (bikelanes) {
                $scope.bikelanes = bikelanes;
                $scope.loadingInProgress = false;
            }, function () {
                $scope.loadingInProgress = false;
            });
        };

        $scope.loadPointsOfInterests = function () {
            // $scope.loadingInProgress = true;

            InterestRepository.query({
                    type: 'water-point'
                },
                function (waterPoints) {
                    $scope.waterPoints = waterPoints;
                }, function () {});


            InterestRepository.query({
                    type: 'velotoulouse'
                },
                function (velotoulouse) {
                    $scope.velotoulouse = velotoulouse;
                }, function () {});

            InterestRepository.query({
                    type: 'wc'
                },
                function (wcs) {
                    $scope.wcs = wcs;
                }, function () {});

            InterestRepository.query({
                    type: 'danger'
                },
                function (dangers) {
                    $scope.dangers = dangers;
                }, function () {});

            InterestRepository.query({
                    type: 'merimee'
                },
                function (merimees) {
                    $scope.merimees = merimees;
                }, function () {});


        };


        return $scope.init();
    }

})();