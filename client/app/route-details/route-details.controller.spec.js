'use strict';

describe('Controller: RouteDetailsCtrl', function () {

  // load the controller's module
  beforeEach(module('bikeTouringMapApp'));

  var RouteDetailsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RouteDetailsCtrl = $controller('RouteDetailsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
