const router = require('express').Router();

router.get('/', function(req, res, next) {

    return res.status(200).json({ "status": "OK" });

});

module.exports = router;
