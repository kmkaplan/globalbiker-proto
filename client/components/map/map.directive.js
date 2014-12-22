'use strict';


angular.module('globalbikerWebApp')
    .directive('map', function (mapCreationService, mapItemsService) {
        return {
            restrict: 'EA',
            templateUrl: 'components/map/map.html',
            scope: {
                config: '='
            },
            link: {
                pre: function preLink($scope, element, attrs) {


                },
                post: function postLink($scope, element, attrs) {

                    var mapElement = element.find('div')[0];

                    if (!$scope.config){
                        $scope.config = {};
                    }
                    
                    $scope.map = mapCreationService.create(mapElement, $scope.config);

                    $scope.$watch('config.bounds', function(bounds){
                        mapCreationService.fitBounds($scope.map, bounds);
                    });
                    
                    $scope.$watch('config.items', function(items){
                        mapItemsService.clearMap($scope.map);
                        mapItemsService.drawItems($scope.map, items, $scope.config);
                    });
                    
                    $scope.$watch('config.drawingTools', function(drawingTools){
                         mapCreationService.configureDrawTools($scope.map, drawingTools, $scope.config);
                    });
                }
            }
        };
    });