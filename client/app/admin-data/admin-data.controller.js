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
                        $scope.$watch('interests', function (interests, old) {
                            if (interests) {
                                eMap.addItemsToGroup(bikeTourMapService.buildInterestsFeatures(interests), {
                                    name: 'Points d\'intérêt',
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
            $scope.loadingInProgress = true;
            InterestRepository.query(function (interests) {
                $scope.interests = interests;
                $scope.loadingInProgress = false;
            }, function () {
                $scope.loadingInProgress = false;
            });
        };


        return $scope.init();
    });