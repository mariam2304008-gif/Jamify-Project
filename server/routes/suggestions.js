const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/suggestionController');
const isLoggedIn = require('../middleware/isLoggedIn');

router.get('/', isLoggedIn, ctrl.index);
router.post('/', isLoggedIn, ctrl.create);

module.exports = router;
