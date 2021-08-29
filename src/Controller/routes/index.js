const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100 // Amount of requests
});

router.use('/stats', apiLimiter, require('./stats'));
router.use('/status', apiLimiter, require('./status'));

module.exports = router;