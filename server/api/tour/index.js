'use strict';

var express = require('express');
var controller = require('./tour.controller');
var auth = require('../../auth/auth.service');
var TourService = require('../tour/tour.service');

var router = express.Router();

router.post('/reference/:reference/upload/trace', auth.hasRole('admin'), controller.uploadTrace);
router.get('/', controller.indexAnonymous);
router.get('/all', auth.isAuthenticated(), controller.indexConnected);
router.get('/mines', auth.isAuthenticated(), controller.mines);
router.get('/:reference', controller.getByReference);
router.get('/reference/:reference', controller.getByReference);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
