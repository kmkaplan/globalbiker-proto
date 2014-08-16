'use strict';

angular.module('bikeTouringMapApp')
  .controller('HomeCtrl', function ($scope) {
        $scope.addMail = function() {
            var mailingRepository;
            mailingRepository = new MailingRepository();
            mailingRepository.addMail();
        }
  });
