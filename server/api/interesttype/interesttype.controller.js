'use strict';

var _ = require('lodash');
var Interesttype = require('./interesttype.model');

// Get list of interesttypes
exports.index = function(req, res) {
  Interesttype.find(function (err, interesttypes) {
    if(err) { return handleError(res, err); }
    return res.json(200, interesttypes);
  });
};

// Get a single interesttype
exports.show = function(req, res) {
  Interesttype.findById(req.params.id, function (err, interesttype) {
    if(err) { return handleError(res, err); }
    if(!interesttype) { return res.send(404); }
    return res.json(interesttype);
  });
};

// Creates a new interesttype in the DB.
exports.create = function(req, res) {
  Interesttype.create(req.body, function(err, interesttype) {
    if(err) { return handleError(res, err); }
    return res.json(201, interesttype);
  });
};

// Updates an existing interesttype in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Interesttype.findById(req.params.id, function (err, interesttype) {
    if (err) { return handleError(res, err); }
    if(!interesttype) { return res.send(404); }
    var updated = _.merge(interesttype, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, interesttype);
    });
  });
};

// Deletes a interesttype from the DB.
exports.destroy = function(req, res) {
  Interesttype.findById(req.params.id, function (err, interesttype) {
    if(err) { return handleError(res, err); }
    if(!interesttype) { return res.send(404); }
    interesttype.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}