'use strict';

var express = require('express');
var controller = require('./interest.controller');

var auth = require('../../auth/auth.service');
var router = express.Router();

router.get('/search/point', controller.searchAroundPoint);
router.get('/search/tour', controller.searchAroundTour);
router.get('/search/step', controller.searchAroundStep);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/step/:stepId', controller.getByStep);
router.get('/tour/:tourId', controller.getByTour);
router.post('/upload/:type', auth.hasRole('admin'), controller.upload);
router.delete('/:id/photo', auth.hasRole('admin'), controller.deletePhoto);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.update);
router.patch('/:id', auth.hasRole('admin'), controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;