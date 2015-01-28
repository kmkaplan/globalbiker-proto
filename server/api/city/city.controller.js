'use strict';

var _ = require('lodash');
var City = require('./city.model');

// Get list of citys
exports.index = function(req, res) {
  City.find(function (err, citys) {
    if(err) { return handleError(res, err); }
    return res.json(200, citys);
  });
};

// Get a single city
exports.show = function(req, res) {
  City.findById(req.params.id, function (err, city) {
    if(err) { return handleError(res, err); }
    if(!city) { return res.send(404); }
    return res.json(city);
  });
};

// Creates a new city in the DB.
exports.create = function(req, res) {
  City.create(req.body, function(err, city) {
    if(err) { return handleError(res, err); }
    return res.json(201, city);
  });
};

// Updates an existing city in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  City.findById(req.params.id, function (err, city) {
    if (err) { return handleError(res, err); }
    if(!city) { return res.send(404); }
    var updated = _.merge(city, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, city);
    });
  });
};

// Deletes a city from the DB.
exports.destroy = function(req, res) {
  City.findById(req.params.id, function (err, city) {
    if(err) { return handleError(res, err); }
    if(!city) { return res.send(404); }
    city.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}