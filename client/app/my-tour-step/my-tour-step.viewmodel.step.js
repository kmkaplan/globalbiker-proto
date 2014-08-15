
angular.module('bikeTouringMapApp').factory('MyTourStepViewModelStep', function () {
    return function (step, tour) {
        //set defaults properties and functions
        angular.extend(this, {
            tour: null,
            difficulty: null,
            cityFrom: null,
            cityTo: null,
            distance: null,
            readableDistance: null,
            points: [],
            isTraceInEdition: false,
            isPersisted: function () {
                return typeof (this._id) !== 'undefined';
            },
            hasTrace: function(){
                return this.points && this.points.length !== 0;
            }
        });
        angular.extend(this, step);
        
        if (this.distance){
            this.readableDistance = L.GeometryUtil.readableDistance(this.distance, 'metric');
        }
        
        this.tour = tour;
    };
});
