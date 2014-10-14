'use strict';

var express = require('express');
var controller = require('./bikelane.controller');

var auth = require('../../auth/auth.service');
var router = express.Router();

router.get('/search', controller.search);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', auth.hasRole('admin'), controller.create);
router.post('/upload', auth.hasRole('admin'), controller.upload);
router.put('/:id', auth.hasRole('admin'), controller.update);
router.patch('/:id', auth.hasRole('admin'), controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;