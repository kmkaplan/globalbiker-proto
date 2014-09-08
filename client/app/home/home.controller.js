'use strict';

angular.module('bikeTouringMapApp')
  .controller('HomeCtrl', function ($scope, MailingRepository) {
        $scope.addMail = function($email, $) {
            var mailingRepository;
            mailingRepository = new MailingRepository( {
                email : $email
            });
            mailingRepository.$save(function() {alert("Merci, votre adresse est bien enregistrée!")});
        }
  });
