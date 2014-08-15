angular.module('bikeTouringMapApp').factory('MyTourViewModelCity', function (geonames) {
    return function (data) {
        //set defaults properties and functions
        angular.extend(this, {
            geonameId: null,
            name: null,
            toponymName: null,
            adminName1: null,
            latitude: null,
            longitude: null,

            isValid: function () {
                if (this.geonameId) {
                    return true;
                }
                return false;
            }
        });
        angular.extend(this, data);

        this.label = geonames.cityToNameAndAdminName1(this);
    };
});
