/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Step = require('./step.model');

exports.register = function(socket) {
  Step.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Step.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('step:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('step:remove', doc);
}
