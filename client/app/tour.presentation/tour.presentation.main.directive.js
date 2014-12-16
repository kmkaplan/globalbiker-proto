(function () {
    'use strict';

    angular.module('globalbikerWebApp')
        .directive('tourPresentationMain', function () {
            return {
                templateUrl: 'app/tour.presentation/tour.presentation.main.html',
                restrict: 'EA',
                scope: {
                    tour: '=',
                    isAllowedToEdit: '=',
                    save: '&'
                },
                link: {
                    pre: function preLink($scope, $element, $attrs) {

                        
                    }
                }
            }
        });
})();
