(function () {
    angular.module('globalbikerWebApp').run(function (DS, socket) {

        DS.defineResource({
            name: 'regions',
            idAttribute: 'reference'
        });

    });

}());