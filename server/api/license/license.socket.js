/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var License = require('./license.model');

exports.register = function(socket) {
  License.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  License.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('license:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('license:remove', doc);
}