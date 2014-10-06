'use strict';

var express = require('express');
var controller = require('./step.controller');

var router = express.Router();

router.post('/upload/trace', controller.uploadTrace);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/tour/:tourId', controller.getByTour);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
