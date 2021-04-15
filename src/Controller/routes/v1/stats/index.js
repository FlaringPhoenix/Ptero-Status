const router = require('express').Router();
const Cache = require('liquidcache');

router.post('/:node', function(req, res, next) {

    let nodeName = req.params.node;
    if (!nodeName) return res.status(404).json({ error: 'missing node name' });
    
    let nodeData = req.body;
    if (!nodeData) return res.status(404).json({ error: 'missing body' });

    let nodes = Cache.get('nodes');

    let existsIndex = nodes.map(n => n.nodeName).indexOf(nodeData.nodeName);
    if (existsIndex == -1) {
        nodes.push(nodeData);
    } else {
        nodes[existsIndex] = nodeData;
    }

    Cache.set('nodes', nodes.sort(function(a, b) {
        return a.nodeName.localeCompare(b.nodeName);
    }));

    return res.status(200);

});

router.get('/', function(req, res, next) {

    let nodes = Cache.get('nodes');
    if (!nodes) return res.status(404).json({ error: "no nodes were found" });

    nodes.forEach((n, i) => {
        let difference = Date.now() - n.lastUpdated;
        nodes[i]['online'] = difference > n.cacheInterval * 2; 
    });

    return res.status(200).json(nodes);

});

module.exports = router;
