'use strict';

var express = require('express');
var controller = require('./interest.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/step/:stepId', controller.getByStep);
router.post('/:id/upload', controller.upload);
router.delete('/:id/photo', controller.deletePhoto);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;