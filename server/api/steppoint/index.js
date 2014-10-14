'use strict';

var express = require('express');
var controller = require('./steppoint.controller');

var auth = require('../../auth/auth.service');
var router = express.Router();

router.get('/', controller.index);
router.get('/step/:stepId', controller.getByStep);
router.delete('/step/:stepId', auth.hasRole('admin'), controller.deleteByStep);
router.put('/step/:stepId', auth.hasRole('admin'), controller.updateByStep);
router.post('/upload', auth.hasRole('admin'), controller.upload);
router.get('/:id', controller.show);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.update);
router.patch('/:id', auth.hasRole('admin'), controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
