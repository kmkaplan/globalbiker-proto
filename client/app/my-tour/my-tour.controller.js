'use strict';

angular.module('bikeTouringMapApp')
    .controller('MyTourCtrl', function ($scope, $http) {
        
        $scope.tourCountry = null;
        
        $scope.steps = [{
            
        }];
        
        $scope.getCountry = function (val) {
            return $http.get('http://api.geonames.org/searchJSON?name_startsWith=' + val + '&featureCode=PCLI&maxRows=10&username=toub', {
                params: {
                    address: val,
                    sensor: false
                }
            }).then(function (res) {
                var countries = [];
                angular.forEach(res.data.geonames, function (item) {
                    item.label = item.countryName + ' (' + item.countryCode + ')';
                    countries.push(item);
                });
                return countries;
            });
        };
        $scope.getCity = function (val) {
            return $http.get('http://api.geonames.org/searchJSON?name_startsWith=' + val + '&cities=cities1000&country=' + $scope.tourCountry.countryCode + '&maxRows=10&username=toub', {
                params: {
                    address: val,
                    sensor: false
                }
            }).then(function (res) {
                var cities = [];
                angular.forEach(res.data.geonames, function (item) {
                    item.label = item.name;
                    cities.push(item);
                });
                return cities;
            });
        };
        
       $scope.$watch('steps', function(newSteps, oldSteps) {
           var isFilled = true;
           var previousCityTo = null;
           for(var i = 0; i < newSteps.length; i++){
               var step = newSteps[i];
                if (!step.cityFrom || !step.cityFrom.geonameId || !step.cityTo || !step.cityTo.geonameId || !step.difficulty){
                    isFilled = false;
                    break;
               }
               previousCityTo =step.cityTo;
            }
           if (isFilled){
             $scope.steps.push({cityFrom: previousCityTo});
           }
       }, true);
    });