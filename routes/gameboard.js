var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  
	var ipAddr = req.headers["x-forwarded-for"];
	if (ipAddr) {
		var list = ipAddr.split(",");
		ipAddr = list[list.length-1];
	} else {
		ipAddr = req.connection.remoteAddress;
	}
  res.render('gameboard', { title: 'Nodopoly', ipAddress: ipAddr });
});

module.exports = router;