(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('CreateTourMainCtrl', CreateTourMainCtrl);

    function CreateTourMainCtrl(tour, $scope, $q, $state, Auth, TourRepository, securityService) {

        // scope properties
        $scope.securityService = securityService;
        $scope.isAdmin = Auth.isAdmin;
        $scope.tinymceOptions = {
            height: '200px',
            menubar: false,
            toolbar: 'bold italic bullist numlist outdent indent removeformat subscript superscript'
        };
        $scope.tour = tour;

        // scope methods
        $scope.createTour = createTour;
        $scope.progress = progress;

        // init method
        init();

        function init() {
            if (!Auth.isLoggedIn) {
                $state.go('home');
            }
        };

        function progress() {
            var progress = 0;
            if ($scope.tour && $scope.tour.cityFrom && $scope.tour.cityTo) {
                progress++;
                if ($scope.tour.travelWith && $scope.tour.keywords && $scope.tour.keywords.length) {
                    progress++;
                    if ($scope.tour.interest && $scope.tour.difficulty) {
                        progress++;
                        if ($scope.tour.description) {
                            progress++;
                        }
                    }
                }
            }
            return progress;
        }

        function createTour(tour) {
            var deffered = $q.defer();

            var user = Auth.getCurrentUser();

            tour.userId = user._id;
            tour.authors = [user._id];
            tour.country = {
                // geonames
                "geonameId": 3017382,
                "countryCode": "FR",
                "name": "France"
            };

            // create resource
            new TourRepository(tour).$save(function (tour, putResponseHeaders) {
                // success
                deffered.resolve(tour);
                $state.go('tour.view', {
                    reference: tour.reference
                });
            }, function (err) {
                // error
                deffered.reject(err);
            });

            return deffered.promise;
        }

    }
})();