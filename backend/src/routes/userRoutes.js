const express = require('express');
const router = express.Router();
const { getMe, updateMe } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, updateMe);

module.exports = router;
