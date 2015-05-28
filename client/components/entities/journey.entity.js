(function () {
    angular.module('globalbikerWebApp').run(function (DS, socket) {

        DS.defineResource({
            name: 'journeys',
            idAttribute: 'reference'
        });

    });

}());