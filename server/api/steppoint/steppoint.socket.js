/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Steppoint = require('./steppoint.model');

exports.register = function(socket) {
  Steppoint.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Steppoint.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('steppoint:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('steppoint:remove', doc);
}
