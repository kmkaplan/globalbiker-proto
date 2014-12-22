(function () {

    'use strict';

    angular.module('globalbikerWebApp').factory('securityService', securityService);

    function securityService(Auth) {

        var service = {
            isTourEditable: isTourEditable
        };

        return service;

        function isTourEditable(tour) {
            if (tour && Auth.isLoggedIn() && (Auth.isAdmin() || tour.userId === Auth.getCurrentUser()._id)) {
                return true;
            }
            return false;
        }
        
    }
})();