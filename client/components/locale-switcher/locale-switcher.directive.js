(function () {
    'use strict';

    angular.module('globalbikerWebApp').directive('localeSwitcher', localeSwitcher);

    function localeSwitcher($translate) {
        return {
            templateUrl: 'components/locale-switcher/locale-switcher.html',
            restrict: 'EA',
            scope: {},
            link: {
                pre: function preLink($scope, $element, $attrs) {

                    // scope properties
                    $scope.selectedLocale;
                    $scope.locales = [
                        {
                            code: "en",
                            img: "/assets/images/languages/gb.png",
                            name: "English"
                        },
                        {
                            code: "fr",
                            img: "/assets/images/languages/fr.png",
                            name: "Français"
                        }];


                    // scope methods
                    $scope.switchTo = switchTo;

                    // init method
                    init();

                    function init() {

                        var code = $translate.use();

                        $scope.selectedLocale = $scope.locales.reduce(function (selectedLocale, locale) {
                            if (locale.code === code) {
                                return locale;
                            }
                            return selectedLocale;
                        });

                        $scope.$watch('selectedLocale', function (selectedLocale, old) {
                            switchTo(selectedLocale);
                        });

                    }

                    function switchTo($item, $model) {
                        if ($item && $item.code && $item.code !== $translate.use()) {
                            $translate.use($item.code);
                        }
                    }
                }
            }
        };
    }
})();