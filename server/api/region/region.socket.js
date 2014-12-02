/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Region = require('./region.model');

exports.register = function(socket) {
  Region.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Region.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('region:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('region:remove', doc);
}