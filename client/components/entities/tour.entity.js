(function () {
    angular.module('globalbikerWebApp').run(function (DS, socket) {

        DS.defineResource({
            name: 'tours',
            idAttribute: 'reference'
        });

    });

}());