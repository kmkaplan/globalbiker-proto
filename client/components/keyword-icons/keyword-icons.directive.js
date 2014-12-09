(function () {
    'use strict';

    angular.module('globalbikerWebApp')
        .directive('keywordIcons', function () {
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
                        $scope.selectedKeys = [];

                        // scope methods
                        $scope.openClose = openClose;
                        $scope.select = select;

                        // init method
                        init();

                        function init() {

                            initOptions();

                            $scope.selectedKeys = $scope.options.reduce(function (selectedKeys, option) {

                                option.iconClass = 'icon-tag-' + option.key;

                                if ($scope.model !== null && $scope.model.indexOf(option.key) !== -1) {
                                    option.selected = true;
                                    selectedKeys.push(option.key);
                                }
                                option.getClasses = function () {
                                    var s = this.iconClass;

                                    if (this.selected === true) {
                                        s += ' selected-icon';
                                    }

                                    return s;
                                }

                                return selectedKeys;
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
                                    key: 'river',
                                    label: 'my-tour.keywords.river'
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

                        function select(option) {
                            if (option.selected) {
                                // unselect
                                option.selected = false;
                                var index = $scope.selectedKeys.indexOf(option.key);
                                if (index > -1) {
                                    $scope.selectedKeys.splice(index, 1);
                                }
                            } else {
                                // select
                                option.selected = true;
                                $scope.selectedKeys.push(option.key);
                                $scope.model = $scope.selectedKeys;
                            }

                        }

                    }
                }
            };
        });
})();