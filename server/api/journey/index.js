'use strict';

var express = require('express');
var controller = require('./journey.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:reference', controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.patch('/:reference', auth.isAuthenticated(), controller.patch);
router.delete('/:reference', auth.isAuthenticated(), controller.destroy);




module.exports = router;