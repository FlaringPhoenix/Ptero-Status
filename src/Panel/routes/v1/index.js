const router = require('express').Router();

router.use('/status', require('./status'));
router.use('/stats', require('./stats'));

module.exports = router;
