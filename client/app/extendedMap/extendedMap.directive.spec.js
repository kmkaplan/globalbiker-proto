'use strict';

describe('Directive: extendedMap', function () {

  // load the directive's module and view
  beforeEach(module('bikeTouringMapApp'));
  beforeEach(module('app/extendedMap/extendedMap.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<extended-map></extended-map>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the extendedMap directive');
  }));
});