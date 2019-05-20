let express = require('express');
let router = express.Router();
const Register = require('../controller/register.js')

router.post('/comment', (req, res) =>
{
	console.log(req.body);
});

router.post('/register', (req, res) =>
{
	Register.parseForm(req.body, (error, success) =>
	{
		if (error) {
			res.status(200).send(error);
		}
		else {
			res.status(200).send('1');
		}
	})
	
});

module.exports = router;
