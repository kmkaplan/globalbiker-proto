/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Journey = require('./journey.model');

exports.register = function(socket) {
  Journey.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Journey.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('journey:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('journey:remove', doc);
}