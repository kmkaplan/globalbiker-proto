'use strict';

var express = require('express');
var controller = require('./interest.controller');

var router = express.Router();

router.get('/search/point', controller.searchAroundPoint);
router.get('/search/tour', controller.searchAroundTour);
router.get('/search/step', controller.searchAroundStep);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/step/:stepId', controller.getByStep);
router.get('/tour/:tourId', controller.getByTour);
router.post('/:id/upload-photo', controller.uploadPhoto);
router.post('/upload/:type', controller.upload);
router.delete('/:id/photo', controller.deletePhoto);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;