const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const suggCtrl  = require('../controllers/suggestionController');
const isLoggedIn = require('../middleware/isLoggedIn');
const isAdmin    = require('../middleware/isAdmin');
const upload     = require('../middleware/upload');

router.use(isLoggedIn, isAdmin);
router.get('/', adminCtrl.showManage);

// Suggestion management
router.get('/suggestions',              suggCtrl.adminIndex);
router.post('/suggestions/:id/approve', suggCtrl.approve);
router.post('/suggestions/:id/reject',  suggCtrl.reject);

// Admin add music — multer handles the image upload (single field named "image")
router.get('/add',  adminCtrl.showAdd);
router.post('/add', upload.single('image'), adminCtrl.addMusic);

// Admin manage — list, edit, delete albums and songs
router.get('/manage',                      adminCtrl.showManage);
router.get('/edit/:type/:id',              adminCtrl.showEdit);
router.post('/edit/:type/:id', upload.single('image'), adminCtrl.updateMusic);
router.post('/delete/:type/:id',           adminCtrl.deleteMusic);

// Review moderation
router.get('/reviews',              adminCtrl.reviewIndex);
router.post('/reviews/:id/approve', adminCtrl.approveReview);
router.post('/reviews/:id/deny',    adminCtrl.denyReview);

module.exports = router;
