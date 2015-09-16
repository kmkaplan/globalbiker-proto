'use strict';

var express = require('express');
var controller = require('./photo.controller');
var auth = require('../../auth/auth.service');
var localEnv = require('../../config/local.env');
var PhotoService = require('./photo.service');
var uploadService = PhotoService.uploadService();

var router = express.Router();

router.get('/search/step', controller.searchAroundStep);
router.get('/search/tour', controller.searchAroundTour);
router.get('/', controller.index);
router.get('/:id', controller.show);
/*router.post('/', auth.hasRole('admin'), controller.create);
router.post('/upload', auth.hasRole('admin'), controller.upload);*/
router.post('/', uploadService.single('file'), auth.isAuthenticated(), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.update);
router.patch('/:id', auth.hasRole('admin'), controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;