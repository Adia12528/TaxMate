const express = require('express');
const authController = require("../controllers/auth.controller")
const router = express.Router();
const authenticateUser = require('../controllers/auth.middleware');

router.post('/user/register', authController.registerUser);

router.post('/user/login', authController.loginUser);


router.get('/user/profile', authenticateUser, (req, res) => {
  res.json(req.user);
});

module.exports = router;