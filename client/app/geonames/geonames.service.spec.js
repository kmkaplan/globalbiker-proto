'use strict';

describe('Service: geonames', function () {

  // load the service's module
  beforeEach(module('bikeTouringMapApp'));

  // instantiate service
  var geonames;
  beforeEach(inject(function (_geonames_) {
    geonames = _geonames_;
  }));

  it('should do something', function () {
    expect(!!geonames).toBe(true);
  });

});
