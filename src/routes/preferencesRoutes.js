const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware'); // should set req.user.userId
const prefs = require('../controllers/PreferencesController');

router.get('/getPreferences', auth, prefs.getPreferences);
router.put('/putPreferences', auth, prefs.updatePreferences);

module.exports = router;
