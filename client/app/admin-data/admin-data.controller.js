(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('AdminDataCtrl', AdminDataCtrl);


    function AdminDataCtrl($scope, $upload, InterestRepository, BikelaneRepository, interestsMarkerBuilderService) {

        var lngMin = -4.5;
        var lngMax = 8;
        var latMin = 43;
        var latMax = 50.5;

        $scope.provenceMapConfig = {
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

        init();

        function init() {
            loadProvenceMap();
        }

        function loadProvenceMap() {

            InterestRepository.query({
                    type: 'food'
                },
                function (interests) {
                    var features = [];

                    features = features.concat(interestsMarkerBuilderService.build(interests));

                    if (features) {
                        $scope.provenceMapConfig.items = features;
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

            // $scope.bikelines = 0;

            //$scope.loadBikelanes();

            //$scope.loadPointsOfInterests();

            /*$scope.mapConfig = {
                class: 'admin-data-map',
                initialCenter: {
                    lat: 43.61,
                    lng: 1.44,
                    zoom: 12
                },
                callbacks: {
                    'map:created': function (eMap) {
                        $scope.$watch('bikelanes', function (bikelanes, old) {
                            if (bikelanes) {
                                eMap.addItemsToGroup(bikeTourMapService.buildBikelanesFeatures(bikelanes), {
                                    name: 'Pistes cyclables',
                                    control: true,
                                    show: false
                                });
                            }
                        });
                        $scope.$watch('waterPoints', function (waterPoints, old) {
                            if (waterPoints) {
                                eMap.addItemsToGroup(bikeTourMapService.buildInterestsFeatures(waterPoints, {
                                    mode: 'light'
                                }), {
                                    name: 'Points d\'eau potable',
                                    control: true
                                });
                            }
                        });

                        $scope.$watch('velotoulouse', function (velotoulouse, old) {
                            if (velotoulouse) {
                                eMap.addItemsToGroup(bikeTourMapService.buildInterestsFeatures(velotoulouse, {
                                    mode: 'light'
                                }), {
                                    name: 'Stations vélo Toulouse',
                                    control: true
                                });
                            }
                        });

                        $scope.$watch('wcs', function (wcs, old) {
                            if (wcs) {
                                eMap.addItemsToGroup(bikeTourMapService.buildInterestsFeatures(wcs, {
                                    mode: 'light'
                                }), {
                                    name: 'Sanisettes publiques',
                                    control: true
                                });
                            }
                        });

                        $scope.$watch('merimees', function (merimees, old) {
                            if (merimees) {
                                eMap.addItemsToGroup(bikeTourMapService.buildInterestsFeatures(merimees, {
                                    mode: 'light'
                                }), {
                                    name: 'Base mérimée',
                                    control: true
                                });
                            }
                        });

                        $scope.$watch('dangers', function (dangers, old) {
                            if (dangers) {
                                eMap.addItemsToGroup(bikeTourMapService.buildInterestsFeatures(dangers, {
                                    mode: 'light'
                                }), {
                                    name: 'Dangers',
                                    control: true
                                });
                            }
                        });
                    }
                }
            };*/


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


            /*  InterestRepository.query(function (items) {
                $scope.items = items;
                $scope.loadingInProgress = false;
            }, function () {
                $scope.loadingInProgress = false;
            });*/
        };


        return $scope.init();
    }

})();