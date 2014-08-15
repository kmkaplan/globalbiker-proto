'use strict';

angular.module('bikeTouringMapApp')
  .controller('HomeCtrl', function ($scope) {
        $scope.addMail = function() {
            alert("OUI");
            var mailingRepository;
            mailingRepository = new MailingRepository({

                })
            mailingRepository.addMail();
        }
  });
