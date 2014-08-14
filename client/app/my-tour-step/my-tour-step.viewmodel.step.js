
angular.module('bikeTouringMapApp').factory('MyTourStepViewModelStep', function () {
    return function (step, tour) {
        //set defaults properties and functions
        angular.extend(this, {
            tour: null,
            difficulty: null,
            cityFrom: null,
            cityTo: null,
            isPersisted: function () {
                return typeof (this._id) !== 'undefined';
            }
        });
        angular.extend(this, step);
        
        this.tour = tour;
    };
});
