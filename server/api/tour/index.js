'use strict';

var express = require('express');
var controller = require('./tour.controller');
var auth = require('../../auth/auth.service');
var TourService = require('../tour/tour.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/mines', auth.isAuthenticated(), controller.mines);
router.get('/:id', controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
