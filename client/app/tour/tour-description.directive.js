(function () {
    'use strict';

    angular.module('globalbikerWebApp')
        .directive('tourDescription', function () {
            return {
                templateUrl: 'app/tour/tour-description.html',
                restrict: 'EA',
                scope: {
                    tour: '=',
                    isAllowedToEdit: '=',
                    save: '&'
                },
                link: {
                    pre: function preLink($scope, $element, $attrs) {

                        // scope properties
                        $scope.inEdition = false;
                        $scope.tinymceOptions = {
                            height: '200px',
                            menubar: false,
                            toolbar: 'bold italic bullist numlist outdent indent removeformat subscript superscript'
                        };

                        // scope methods
                        $scope.edit = edit;

                        function edit() {
                            $scope.inEdition = true;
                        }
                        
                        $scope.saveTour = function(){
                            $scope.save({tour: $scope.tour}).then(function(){
                                $scope.inEdition = false;
                            });
                        };
                    }
                }
            }
        });
})();