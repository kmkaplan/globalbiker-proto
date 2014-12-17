(function () {
    'use strict';

    angular.module('globalbikerWebApp').filter('stepLabel', stepLabel);

    function stepLabel($rootScope, $timeout, $q, $translate) {

        var filter = this;

        var fromToLabel = function (step) {
            return '';
        }

        var filterFn = function initialFilter(step) {
            var label;
            if (step.cityFrom && step.cityTo) {
                if (step.cityFrom.name === step.cityTo.name) {
                    // same source & destination
                    label = step.cityFrom.name;
                } else {
                    label = fromToLabel(step);
                }
            } else {
                label = '';
            }

            return label;
        };

        var updateLocalization = function () {
            $translate(['global.step.from', 'global.step.to']).then(function (translations) {
                console.log(translations);
                filter.labels = {
                    from: translations['global.step.from'],
                    to: translations['global.step.to']
                };
                fromToLabel = function (step) {
                    return filter.labels.from + ' ' + step.cityFrom.name + ' ' + filter.labels.to + ' ' + step.cityTo.name;
                }
            });
        };

        // first i18n
        updateLocalization();

        // event listner when local changes
        $rootScope.$on('$translateChangeSuccess', function () {
            updateLocalization();
        });

        return function tempFilter(str) {
            return filterFn(str);
        };
    };
})();