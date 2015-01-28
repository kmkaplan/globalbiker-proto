(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('CreateTourMainCtrl', CreateTourMainCtrl);

    function CreateTourMainCtrl(tour, $scope, $q, $state, Auth, TourRepository, CountryRepository, securityService) {

        // scope properties
        $scope.securityService = securityService;
        $scope.isAdmin = Auth.isAdmin;
        $scope.tinymceOptions = {
            height: '200px',
            menubar: false,
            toolbar: 'bold italic bullist numlist outdent indent removeformat subscript superscript'
        };
        $scope.tour = tour;
        $scope.countries;
        $scope.countryOfDeparture;
        $scope.countryOfArrival;

        // scope methods
        $scope.createTour = createTour;
        $scope.progress = progress;

        // init method
        init();

        function init() {
            if (!Auth.isLoggedIn) {
                $state.go('home');
                return;
            } else {
                loadCountries();
            }
            /* $scope.$watch('tour.cityFrom', function (cityFrom, old) {
                if (cityFrom) {
                    $scope.tour.title = cityFrom.name;
                }
            });*/
        };

        function progress() {
            var progress = 0;
            if ($scope.tour && $scope.tour.title && $scope.tour.cityFrom && $scope.tour.cityTo) {
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

        function loadCountries() {
            CountryRepository.query(function (countries) {
                $scope.countries = countries;
                $scope.countryOfDeparture = countries.reduce(function (defaultCountry, country) {
                    if (country.countryCode === 'FR') {
                        return country;
                    }
                    return defaultCountry;
                }, null);

                $scope.countryOfArrival = $scope.countryOfDeparture;
            });
        }

        function createTour(tour) {
            var deffered = $q.defer();

            var user = Auth.getCurrentUser();

            tour.userId = user._id;
            tour.authors = [user._id];
            tour.country = $scope.countryOfDeparture;

            // create resource
            new TourRepository(tour).$save(function (tour, putResponseHeaders) {
                // success
                deffered.resolve(tour);
                $state.go('tour.edit-trace', {
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