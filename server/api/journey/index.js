'use strict';

var express = require('express');
var controller = require('./journey.controller');
var auth = require('../../auth/auth.service');
var PhotoService = require('../photo/photo.service');
var uploadService = PhotoService.uploadService();

var router = express.Router();

router.get('/', controller.index);
router.get('/:reference', auth.isAuthenticated(false), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.post('/:reference/photo', uploadService.single('file'), auth.isAuthenticated(), controller.addPhoto);
router.patch('/:reference', auth.isAuthenticated(), controller.patch);
router.delete('/:reference', auth.isAuthenticated(), controller.destroy);

module.exports = router;