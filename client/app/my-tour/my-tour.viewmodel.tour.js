
angular.module('bikeTouringMapApp').factory('MyTourViewModelTour', function () {
    return function (data) {
        //set defaults properties and functions
        angular.extend(this, {
            title: null,
            country: null,
            isValid: function () {
                return this.title && this.country && this.country.geonameId;
            },
            isReadyToCreate: function () {
                return !this.isPersisted() && this.isValid();
            },
            isPersisted: function () {
                return typeof (this._id) !== 'undefined';
            },
            originalModel: data
        });
        angular.extend(this, data);
    };
});
