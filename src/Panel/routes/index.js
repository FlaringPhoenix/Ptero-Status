const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100 // Amount of requests
});

router.use('/v1', apiLimiter, require('./v1'));

module.exports = router;