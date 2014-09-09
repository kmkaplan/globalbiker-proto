'use strict';

describe('Controller: AdminDataCtrl', function () {

  // load the controller's module
  beforeEach(module('bikeTouringMapApp'));

  var AdminDataCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdminDataCtrl = $controller('AdminDataCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
