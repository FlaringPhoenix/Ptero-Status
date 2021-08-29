const router = require('express').Router();
const Cache = require('liquidcache');

router.get('/', function(req, res, next) {

    let status = Cache.get('status');
    return res.status(200).json(status);

});

module.exports = router;
