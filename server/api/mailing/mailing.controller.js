'use strict';

var _ = require('lodash');
var Mailing = require('./mailing.model');

// Get list of mailings
exports.index = function(req, res) {
  Mailing.find(function (err, mailings) {
    if(err) { return handleError(res, err); }
    return res.json(200, mailings);
  });
};

// Get a single mailing
exports.show = function(req, res) {
  Mailing.findById(req.params.id, function (err, mailing) {
    if(err) { return handleError(res, err); }
    if(!mailing) { return res.send(404); }
    return res.json(mailing);
  });
};

// Creates a new mailing in the DB.
exports.create = function(req, res) {
  Mailing.create(req.body, function(err, mailing) {
    if(err) { return handleError(res, err); }
    return res.json(201, mailing);
  });
};

// Updates an existing mailing in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Mailing.findById(req.params.id, function (err, mailing) {
    if (err) { return handleError(res, err); }
    if(!mailing) { return res.send(404); }
    var updated = _.merge(mailing, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, mailing);
    });
  });
};

// Deletes a mailing from the DB.
exports.destroy = function(req, res) {
  Mailing.findById(req.params.id, function (err, mailing) {
    if(err) { return handleError(res, err); }
    if(!mailing) { return res.send(404); }
    mailing.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
