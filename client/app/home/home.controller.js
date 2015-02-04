(function () {
    'use strict';

    angular.module('globalbikerWebApp').directive('rotateBackgroundImage', rotateBackgroundImage);

    function rotateBackgroundImage($interval) {
        return function ($scope, element, attrs) {

            // scope attributes
            $scope.backgroundImages = [
                '/assets/images/globalbiker-bolivie-01.png',
                '/assets/images/globalbiker-bolivie-02.png',
                '/assets/images/globalbiker-france-ile-de-re.png'
            ];

            // randomize first image index
            $scope.currentImageIndex = getRandomInt(0, 3);

            // update image
            updateBackgroundImage();

            var rotateInterval = 10000;
            
            // update image every 1 second
            $interval(function () {
                showNextImage();
            }, rotateInterval, $scope.backgroundImages.length * 5, false);

            function showNextImage() {
                // increment index
                $scope.currentImageIndex = ($scope.currentImageIndex + 1) % $scope.backgroundImages.length;

                updateBackgroundImage();
            }

            function getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min)) + min;
            }

            function updateBackgroundImage() {
                // get image from index
                var image = $scope.backgroundImages[$scope.currentImageIndex];

                // update css
                element.css({
                    'background-image': 'url(' + image + ')'
                });
            }

        };
    }


    angular.module('globalbikerWebApp').controller('HomeCtrl', HomeCtrl);

    function HomeCtrl($scope, $stateParams, $state, $q, $translate) {

        if (!$translate.use()){
            console.warn('Locale is not yet defined.');
            $translate.use('fr');
        }
        
        // init method
        init();

        function init() {};

    };
})();