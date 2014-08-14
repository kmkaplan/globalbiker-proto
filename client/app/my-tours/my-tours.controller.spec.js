'use strict';

describe('Controller: MyToursCtrl', function () {

  // load the controller's module
  beforeEach(module('bikeTouringMapApp'));

  var MyToursCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MyToursCtrl = $controller('MyToursCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
