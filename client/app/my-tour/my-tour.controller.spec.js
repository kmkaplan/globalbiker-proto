'use strict';

describe('Controller: MyTourCtrl', function () {

  // load the controller's module
  beforeEach(module('bikeTouringMapApp'));

  var MyTourCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MyTourCtrl = $controller('MyTourCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
