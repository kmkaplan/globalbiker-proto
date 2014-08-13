'use strict';

describe('Service: extendedMapService', function () {

  // load the service's module
  beforeEach(module('bikeTouringMapApp'));

  // instantiate service
  var extendedMapService;
  beforeEach(inject(function (_extendedMapService_) {
    extendedMapService = _extendedMapService_;
  }));

  it('should do something', function () {
    expect(!!extendedMapService).toBe(true);
  });

});
