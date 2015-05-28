'use strict';

var express = require('express');
var controller = require('./step.controller');

var auth = require('../../auth/auth.service');
var router = express.Router();

router.post('/upload/trace', auth.hasRole('admin'), controller.uploadTrace);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/tour/:tourId/reference/:reference', controller.getByReference);
router.get('/tour/:tourId', controller.getByTour);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.update);
router.patch('/:id', auth.hasRole('admin'), controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.delete('/', auth.hasRole('admin'), controller.destroyAll);

module.exports = router;
