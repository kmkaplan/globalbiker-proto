angular.module('bikeTouringMapApp').factory('MyTourStep', function (MyTourStepCity) {
    return function (data) {
        //set defaults properties and functions
        angular.extend(this, {
            status: 'edit',
            difficulty: null,
            cityFrom: null,
            cityTo: null,
            isValidCityFrom: function () {
                return this.cityFrom && this.cityFrom.geonameId;
            },
            isValidCityTo: function () {
                return this.cityTo && this.cityTo.geonameId;
            },
            isValid: function () {
                return this.difficulty && this.isValidCityFrom() && this.isValidCityTo();
            },
            isReadyToSave: function () {
                return this.status === 'edit' && this.isValid();
            },
            isEditable: function () {
                return this.status === 'read-only';
            },
            isPersisted: function () {
                return typeof (this._id) !== 'undefined';
            }

        });
        if (data) {
            if (data.cityFrom) {
                data.cityFrom = new MyTourStepCity(data.cityFrom);
            }
            if (data.cityTo) {
                data.cityTo = new MyTourStepCity(data.cityTo);
            }
        }
        angular.extend(this, data);

        if (this.isPersisted()){
            this.status = 'read-only';
        }
    };
});
