'use strict';

describe('Controller: TourDetailsCtrl', function () {

  // load the controller's module
  beforeEach(module('bikeTouringMapApp'));

  var TourDetailsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TourDetailsCtrl = $controller('TourDetailsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
