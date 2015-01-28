/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var City = require('./city.model');

exports.register = function(socket) {
  City.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  City.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('city:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('city:remove', doc);
}