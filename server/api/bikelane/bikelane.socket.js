/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Bikelane = require('./bikelane.model');

exports.register = function(socket) {
  Bikelane.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Bikelane.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('bikelane:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('bikelane:remove', doc);
}