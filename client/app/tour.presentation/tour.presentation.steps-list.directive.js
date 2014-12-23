(function () {
    'use strict';

    angular.module('globalbikerWebApp')
        .directive('tourPresentationStepsList', function ($state) {
            return {
                templateUrl: 'app/tour.presentation/tour.presentation.steps-list.html',
                restrict: 'EA',
                scope: {
                    steps: '='
                },
                link: {
                    pre: function preLink($scope, $element, $attrs) {

                        // scope methods
                        $scope.openStep = openStep;

                        function openStep(step) {
                            console.info('Open step %d', step._id);
                            $state.go('tour.step.view', {
                                stepId: step._id
                            }, {});
                        };
                    }
                }
            }
        });
})();