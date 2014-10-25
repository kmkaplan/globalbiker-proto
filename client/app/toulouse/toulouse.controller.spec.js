'use strict';

describe('Controller: ToulouseCtrl', function () {

  // load the controller's module
  beforeEach(module('globalbikerWebApp'));

  var ToulouseCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ToulouseCtrl = $controller('ToulouseCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
