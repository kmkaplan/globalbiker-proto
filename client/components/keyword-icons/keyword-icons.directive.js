(function () {
    'use strict';

    angular.module('globalbikerWebApp')
        .directive('keywordIcons', function ($timeout) {
            return {
                templateUrl: 'components/keyword-icons/keyword-icons.html',
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
                        $scope.selectedOptions = [];
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

                            $scope.selectedOptions = $scope.options.reduce(function (selectedOptions, option) {

                                option.iconClass = 'icon-tag-' + option.key;

                                if ($scope.model !== null && $scope.model.indexOf(option.key) !== -1) {
                                    option.selected = true;
                                    selectedOptions.push(option);
                                }
                                option.getClasses = function () {
                                    var s = this.iconClass;

                                    if (this.selected === true) {
                                        s += ' selected-icon';
                                    }

                                    return s;
                                }

                                return selectedOptions;
                            }, [])

                        }

                        function initOptions() {
                            $scope.options = [
                                {
                                    key: 'mountain',
                                    label: 'my-tour.keywords.mountain'
                                }, {
                                    key: 'coastline',
                                    label: 'my-tour.keywords.coastline'
                                }, {
                                    key: 'historic',
                                    label: 'my-tour.keywords.historic'
                                }, {
                                    key: 'rivers',
                                    label: 'my-tour.keywords.rivers'
                                }, {
                                    key: 'large-spaces',
                                    label: 'my-tour.keywords.large-spaces'
                                }, {
                                    key: 'local-people',
                                    label: 'my-tour.keywords.local-people'
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
                            if (option.selected) {
                                // unselect
                                option.selected = false;
                                var index = $scope.selectedOptions.indexOf(option);
                                if (index > -1) {
                                    $scope.selectedOptions.splice(index, 1);
                                }
                            } else {
                                // select
                                option.selected = true;
                                $scope.selectedOptions.push(option);
                                $scope.model = $scope.selectedOptions.reduce(function (selectedOptionsKeys, selectedOption) {
                                    selectedOptionsKeys.push(selectedOption.key);
                                    return selectedOptionsKeys;
                                }, []);
                            }

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