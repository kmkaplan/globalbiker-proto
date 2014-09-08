/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Interest = require('./interest.model');

exports.register = function(socket) {
  Interest.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Interest.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('interest:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('interest:remove', doc);
}