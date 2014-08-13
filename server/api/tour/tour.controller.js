'use strict';

var _ = require('lodash');
var Tour = require('./tour.model');

// Get list of tours
exports.index = function(req, res) {
  Tour.find(function (err, tours) {
    if(err) { return handleError(res, err); }
    return res.json(200, tours);
  });
};

// Get a single tour
exports.show = function(req, res) {
  Tour.findById(req.params.id, function (err, tour) {
    if(err) { return handleError(res, err); }
    if(!tour) { return res.send(404); }
    return res.json(tour);
  });
};

// Creates a new tour in the DB.
exports.create = function(req, res) {
  Tour.create(req.body, function(err, tour) {
    if(err) { return handleError(res, err); }
    return res.json(201, tour);
  });
};

// Updates an existing tour in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Tour.findById(req.params.id, function (err, tour) {
    if (err) { return handleError(res, err); }
    if(!tour) { return res.send(404); }
    var updated = _.merge(tour, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, tour);
    });
  });
};

// Deletes a tour from the DB.
exports.destroy = function(req, res) {
  Tour.findById(req.params.id, function (err, tour) {
    if(err) { return handleError(res, err); }
    if(!tour) { return res.send(404); }
    tour.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}