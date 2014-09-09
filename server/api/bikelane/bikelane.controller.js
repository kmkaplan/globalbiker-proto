'use strict';

var _ = require('lodash');
var Bikelane = require('./bikelane.model');

// Get list of bikelanes
exports.index = function(req, res) {
  Bikelane.find(function (err, bikelanes) {
    if(err) { return handleError(res, err); }
    return res.json(200, bikelanes);
  });
};

// Get a single bikelane
exports.show = function(req, res) {
  Bikelane.findById(req.params.id, function (err, bikelane) {
    if(err) { return handleError(res, err); }
    if(!bikelane) { return res.send(404); }
    return res.json(bikelane);
  });
};

// Creates a new bikelane in the DB.
exports.create = function(req, res) {
  Bikelane.create(req.body, function(err, bikelane) {
    if(err) { return handleError(res, err); }
    return res.json(201, bikelane);
  });
};

// Updates an existing bikelane in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Bikelane.findById(req.params.id, function (err, bikelane) {
    if (err) { return handleError(res, err); }
    if(!bikelane) { return res.send(404); }
    var updated = _.merge(bikelane, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, bikelane);
    });
  });
};

// Deletes a bikelane from the DB.
exports.destroy = function(req, res) {
  Bikelane.findById(req.params.id, function (err, bikelane) {
    if(err) { return handleError(res, err); }
    if(!bikelane) { return res.send(404); }
    bikelane.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}