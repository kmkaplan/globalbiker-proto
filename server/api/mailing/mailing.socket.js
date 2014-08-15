/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Mailing = require('./mailing.model');

exports.register = function(socket) {
  Mailing.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Mailing.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('mailing:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('mailing:remove', doc);
}
