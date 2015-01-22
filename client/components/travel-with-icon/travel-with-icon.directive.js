(function () {
    'use strict';

    angular.module('globalbikerWebApp').directive('travelWithIcon', function ($timeout) {
            return {
                templateUrl: 'components/travel-with-icon/travel-with-icon.html',
                restrict: 'EA',
                scope: {
                    inEdition: '=',
                    model: '='
                },
                link: {
                    pre: function preLink($scope, $element, $attrs) {

                        // scope properties
                        $scope.isSelectVisible = false;
                        $scope.options = [];
                        $scope.selected = null;;
                        $scope.autoCloseTimer = null;

                        // scope methods
                        $scope.openClose = openClose;
                        $scope.open = open;
                        $scope.closeAfterDelay = closeAfterDelay;
                        $scope.select = select;

                        // init method
                        init();

                        function init() {

                            initOptions();

                            $scope.selected = $scope.options.reduce(function (selectedOption, option) {

                                if (!selectedOption && option.key === $scope.model) {
                                    return option;
                                }
                                return selectedOption;
                            }, null)

                        }

                        function initOptions() {
                            $scope.options = [
                                {
                                    key: 'alone',
                                    label: 'my-tour.travel-with.alone'
                                }, {
                                    key: 'family',
                                    label: 'my-tour.travel-with.family'
                                }, {
                                    key: 'friends',
                                    label: 'my-tour.travel-with.friends'
                                }, {
                                    key: 'couple',
                                    label: 'my-tour.travel-with.couple'
                                }];
                        }

                        function openClose() {
                            $scope.isSelectVisible = $scope.inEdition && !$scope.isSelectVisible;
                        }

                        function open() {
                            if ($scope.autoCloseTimer !== null) {
                                $timeout.cancel($scope.autoCloseTimer);
                            }
                            $scope.isSelectVisible = $scope.inEdition && true;
                        }

                        function closeAfterDelay() {
                            if ($scope.isSelectVisible) {
                                $scope.autoCloseTimer = $timeout(
                                    function () {
                                        console.log("Timeout executed", Date.now());
                                        $scope.isSelectVisible = false;
                                    },
                                    300
                                );
                            }
                        }

                        function select(option) {
                            $scope.selected = option;
                            $scope.model = option.key;
                            $scope.isSelectVisible = false;
                        }

                        // cancel timer on leave
                        $scope.$on(
                            "$destroy",
                            function (event) {
                                if ($scope.autoCloseTimer !== null) {
                                    $timeout.cancel($scope.autoCloseTimer);
                                }
                            }
                        );

                    }
                }
            };
        });
})();