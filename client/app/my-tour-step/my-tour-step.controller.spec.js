'use strict';

describe('Controller: MyTourStepCtrl', function () {

  // load the controller's module
  beforeEach(module('globalbikerWebApp'));

  var MyTourStepCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MyTourStepCtrl = $controller('MyTourStepCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
