'use strict';

var _ = require('lodash');
var License = require('./license.model');

// Get list of licenses
exports.index = function(req, res) {
  License.find(function (err, licenses) {
    if(err) { return handleError(res, err); }
    return res.json(200, licenses);
  });
};

// Get a single license
exports.show = function(req, res) {
  License.findById(req.params.id, function (err, license) {
    if(err) { return handleError(res, err); }
    if(!license) { return res.send(404); }
    return res.json(license);
  });
};

// Creates a new license in the DB.
exports.create = function(req, res) {
  License.create(req.body, function(err, license) {
    if(err) { return handleError(res, err); }
    return res.json(201, license);
  });
};

// Updates an existing license in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  License.findById(req.params.id, function (err, license) {
    if (err) { return handleError(res, err); }
    if(!license) { return res.send(404); }
    var updated = _.merge(license, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, license);
    });
  });
};

// Deletes a license from the DB.
exports.destroy = function(req, res) {
  License.findById(req.params.id, function (err, license) {
    if(err) { return handleError(res, err); }
    if(!license) { return res.send(404); }
    license.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}