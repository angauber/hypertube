let express = require('express');
let router = express.Router();

router.post('/comment', (req, res) =>
{
	console.log(req.body);
});

module.exports = router;
