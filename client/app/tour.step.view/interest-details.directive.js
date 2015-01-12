(function () {
    'use strict';

    angular.module('globalbikerWebApp').directive('interestDetails', interestDetails);

    function interestDetails($timeout) {
        return {
            templateUrl: 'app/tour.step.view/interest-details.html',
            restrict: 'EA',
            scope: {
                interest: '='
            },
            link: function ($scope, $element, $attrs) {

                // scope properties

                // scope methods

                // init method
                init();

                function init() {

                }
            }
        };
    }
})();