(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('TourCreateStepCtrl', TourCreateStepCtrl);

    function TourCreateStepCtrl(tour, $scope, $q, $state, Auth, StepRepository, CountryRepository, securityService) {

        // scope properties
        $scope.securityService = securityService;
        $scope.isAdmin = Auth.isAdmin;
        $scope.tinymceOptions = {
            height: '200px',
            menubar: false,
            toolbar: 'bold italic bullist numlist outdent indent removeformat subscript superscript'
        };
        $scope.step = {
            tourId: tour._id
        };
        $scope.countries;
        $scope.countryOfDeparture;
        $scope.countryOfArrival;

        // scope methods
        $scope.createStep = createStep;
        $scope.progress = progress;

        // init method
        init();

        function init() {

            if (!tour || !securityService.isTourEditable(tour)) {
                $state.go('home');
            } else {
                $scope.tour = tour;
                
                 loadCountries();
            }
        };

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
        
        function progress() {
            var progress = 0;
            if ($scope.step && $scope.step.cityFrom && $scope.step.cityTo) {
                progress++;
                if ($scope.step.interest && $scope.step.difficulty) {
                    progress++;
                    if ($scope.step.description) {
                        progress++;
                    }
                }
            }
            return progress;
        }

        function createStep(step) {
            var deffered = $q.defer();

            // create resource
            new StepRepository(step).$save(function (step, putResponseHeaders) {
                // success
                deffered.resolve(step);
                $state.go('tour.step.view', {
                    reference: tour.reference,
                    stepReference: step.reference
                }, {
                    reload: true
                });
            }, function (err) {
                // error
                deffered.reject(err);
            });

            return deffered.promise;
        }

    }
})();