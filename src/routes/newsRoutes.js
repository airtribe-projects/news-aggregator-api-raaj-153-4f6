const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { getNews } = require('../controllers/newsController');

router.get('/getNews', auth, getNews);

module.exports = router;
