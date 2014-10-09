'use strict';

angular.module('bikeTouringMapApp')
    .controller('AdminDataCtrl', function ($scope, $upload, InterestRepository, BikelaneRepository, bikeTourMapService) {

        $scope.bikemapFileupload = {
            url: '/api/bikelanes/upload',
            filename: 'Pistes_Cyclables.json',
            callbacks: {
                success: function (data) {
                    $scope.loadBikelanes();
                }
            }
        };

        $scope.waterpointsUpload = {
            url: '/api/interests/upload/water-point',
            filename: 'fontaines_a_boire.json',
            callbacks: {
                success: function (data) {
                    $scope.loadPointsOfInterests();
                }
            }
        };

        $scope.velotoulouseUpload = {
            url: '/api/interests/upload/velotoulouse',
            filename: 'Velo_Toulouse.json',
            callbacks: {
                success: function (data) {
                    $scope.loadPointsOfInterests();
                }
            }
        };

        $scope.dangersCarrefoursUpload = {
            url: '/api/interests/upload/danger',
            filename: 'acc_carrefours_2008_2012.json',
            callbacks: {
                success: function (data) {
                    $scope.loadPointsOfInterests();
                }
            }
        };

        $scope.merimeeUpload = {
            url: '/api/interests/upload/merimee',
            filename: 'Base_Merimee.json',
            callbacks: {
                success: function (data) {
                    $scope.loadPointsOfInterests();
                }
            }
        };

        $scope.wcUpload = {
            url: '/api/interests/upload/wc',
            filename: 'Sanisette.json',
            callbacks: {
                success: function (data) {
                    $scope.loadPointsOfInterests();
                }
            }
        };


        $scope.init = function () {

            $scope.bikelines = 0;

            $scope.loadBikelanes();
            $scope.loadPointsOfInterests();

            $scope.mapConfig = {
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
            };


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
    });