(function () {
    'use strict';

    angular.module('globalbikerWebApp').controller('JourneyEditTraceCtrl', JourneyEditTraceCtrl);

    function JourneyEditTraceCtrl($scope, $stateParams, $state, $q, $timeout, Auth, securityService, featuresBuilderFileService, tourFeaturesBuilderService, interestsMarkerBuilderService, DS, googleDirections) {

        // scope properties
        $scope.mapConfig = {
            scrollWheelZoom: true
        };
        $scope.regionReference = 'france';
        $scope.tour = {};
        $scope.region;
        $scope.itinaryCalculationInProgress = false;

        // scope methods
        $scope.addWayPoint=function(){
            $scope.tour.wayPoints.push({});
        }
        
        // init method
        init();

        function init() {

            if ($stateParams.tourReference){
                // edit
                DS.find('tours', $stateParams.tourReference).then(function (tour) {
                    $scope.tour = tour;

                    $scope.tour.wayPoints = [
                        {}
                    ];

                }, function (err) {
                    console.error(err);
                });

            }else{
                // create 
                DS.find('regions', $scope.regionReference).then(function (region) {
                    $scope.region = region;
                    $scope.mapConfig.bounds = {
                        geometry: region.geometry
                    };

                }, function (err) {
                    console.error(err);
                });
            }

            $scope.$watch('tour', function (tour, oldTour) {

                updateTourGeometry(tour, oldTour).then(function (tour) {
                    showTourOnMap(tour);
                    if (!tour._id && isValidTourGeometry(tour)) {

                        tour.region = $scope.region._id;

                        if (!tour.title || tour.title.trim().length === 0){
                            tour.title = 'Voyage de ' + tour.cityFrom.name + ' à ' + tour.cityTo.name;
                        }

                        DS.create('tours', tour).then(function (tour) {

                            // go to edit existing tour page
                            $state.go('journey-edit-trace', {tourReference: tour.reference});
                        }, function (err) {
                            console.error(err);
                        });
                    }
                });


            }, true);


        };

        function isSameGeometry(g1, g2) {
            if (g1 && g2) {
                if (g1.type === g2.type) {
                    if (g1.type === 'Point') {
                        if (g1.coordinates.length > 1 && g1.coordinates.length === g2.coordinates.length) {
                            for (var i = 0; i < g1.coordinates.length; i++) {
                                if (g1.coordinates[i] !== g2.coordinates[i]) {
                                    return false;
                                }
                            }
                            return true;
                        }
                    } else {
                        console.error('Geometry type ""%s not supported.', g1.type);
                    }
                }
            }
            return false;
        }

        function isValidTourGeometry(tour) {
            if (tour && tour.cityTo && tour.cityFrom && tour.cityTo.geometry && tour.cityFrom.geometry) {
                return true;
            }
            return false;
        }

        function isTourGeometryUpdated(tour, oldTour) {
            if (!oldTour || (tour.cityFrom !== oldTour.cityFrom) || (tour.cityTo !== oldTour.cityTo) || !isSameGeometry(tour.cityFrom.geometry, oldTour.cityFrom.geometry) || !isSameGeometry(tour.cityTo.geometry, oldTour.cityTo.geometry)) {

                return true;
            }

            if (tour.wayPoints.length > 0){
                var p1 = tour.wayPoints[0];
                if (p1.city && p1.city.geometry){
                    return true;
                }
            }

            return false;
        }

        function toGoogleDirectionsString(geometry){
            return  '' + geometry.coordinates[1] + ',' +geometry.coordinates[0];
        }

        function updateTourGeometry(tour, oldTour) {

            var deffered = $q.defer();

            if (isValidTourGeometry(tour) && isTourGeometryUpdated(tour, oldTour)) {
                // geometry has been updated
                $scope.itinaryCalculationInProgress = true;

                var args = {
                    travelMode: 'bicycling'
                }

                args.origin = toGoogleDirectionsString(tour.cityFrom.geometry);
                args.destination = toGoogleDirectionsString(tour.cityTo.geometry);

                if (tour.wayPoints && tour.wayPoints.length > 0){
                    
                     args.waypoints =tour.wayPoints.reduce(function(waypoints, point){
                         if (point && point.city && point.city.geometry){
                        waypoints.push({ 
                                location: toGoogleDirectionsString(point.city.geometry)
                            });
                         }
                         return waypoints;
                     }, []);
                    // add next way point
                    // tour.wayPoints.push({});
                }

                console.log(tour.cityFrom, tour.cityTo, args.origin, args.destination);

                googleDirections.getDirections(args).then(function (directions) {
                    if (directions.status === 'OK' && directions.routes.length > 0) {
                        var route = directions.routes[0];
                        var coordinates = route.overview_path.reduce(function (coordinates, point) {
                            coordinates.push([point.lng(), point.lat()]);
                            return coordinates;
                        }, []);

                        var geometry = {
                            type: 'LineString',
                            coordinates: coordinates
                        };

                        console.log(geometry);

                        tour.geometry = geometry;
                    }
                    console.log(directions);
                    deffered.resolve(tour);
                }).finally(function (e) {
                    $scope.itinaryCalculationInProgress = false;
                });
            } else {
                deffered.resolve(tour);
            }
            return deffered.promise;
        }

        function showTourOnMap(tour) {
            var features = [];

            // no step geometry: display tour geometry instead
            if (tour.geometry) {
                var feature = tourFeaturesBuilderService.build(tour);
                features.push(feature);
            }

            if (tour.cityFrom) {
                var feature = interestsMarkerBuilderService.buildDeparture(tour.cityFrom);
                features.push(feature);
            }

            if (tour.cityTo) {
                var feature = interestsMarkerBuilderService.buildArrival(tour.cityTo);
                features.push(feature);
            }

            if (features.length !== 0) {

                var geometries = features.reduce(function (geometries, feature) {
                    geometries.push(feature.geometry);
                    return geometries;
                }, []);

                if (!tour.cityFrom || !tour.cityTo) {
                    // keep region geometry while departure and arrival are not set
                    geometries.push($scope.region.geometry);
                }

                $scope.mapConfig.items = features;

                $scope.mapConfig.bounds = {
                    geometry: geometries
                };

            }
        }


    }

})();