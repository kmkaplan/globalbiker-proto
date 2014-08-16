'use strict';

angular.module('bikeTouringMapApp')
  .controller('HomeCtrl', function ($scope, MailingRepository) {
        $scope.addMail = function() {
            var mailingRepository;
            mailingRepository = new MailingRepository( {
                email : "gaudetmatthieu@gmail.com"
            });
            mailingRepository.addMail();
        }
  });
