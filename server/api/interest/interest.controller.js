'use strict';

var _ = require('lodash');
var Interest = require('./interest.model');

// Get list of interests
exports.index = function(req, res) {
  Interest.find(function (err, interests) {
    if(err) { return handleError(res, err); }
    return res.json(200, interests);
  });
};

// Get a single interest
exports.show = function(req, res) {
  Interest.findById(req.params.id, function (err, interest) {
    if(err) { return handleError(res, err); }
    if(!interest) { return res.send(404); }
    return res.json(interest);
  });
};

/**
 * Get interests by step.
 */
exports.getByStep = function (req, res) {

    var stepId = req.params.stepId;

    Interest.find({
        'stepId': stepId
    }, function (err, interests) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, interests);
    });
};

// Creates a new interest in the DB.
exports.create = function(req, res) {
  Interest.create(req.body, function(err, interest) {
    if(err) { return handleError(res, err); }
    return res.json(201, interest);
  });
};

// Updates an existing interest in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Interest.findById(req.params.id, function (err, interest) {
    if (err) { return handleError(res, err); }
    if(!interest) { return res.send(404); }
    var updated = _.merge(interest, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, interest);
    });
  });
};

// Deletes a interest from the DB.
exports.destroy = function(req, res) {
  Interest.findById(req.params.id, function (err, interest) {
    if(err) { return handleError(res, err); }
    if(!interest) { return res.send(404); }
    interest.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}