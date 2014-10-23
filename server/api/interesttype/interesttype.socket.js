/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Interesttype = require('./interesttype.model');

exports.register = function(socket) {
  Interesttype.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Interesttype.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('interesttype:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('interesttype:remove', doc);
}