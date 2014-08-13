/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Tour = require('./tour.model');

exports.register = function(socket) {
  Tour.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Tour.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('tour:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('tour:remove', doc);
}