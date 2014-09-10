'use strict';

var express = require('express');
var controller = require('./steppoint.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/step/:stepId', controller.getByStep);
router.delete('/step/:stepId', controller.deleteByStep);
router.put('/step/:stepId', controller.updateByStep);
router.post('/upload', controller.upload);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;