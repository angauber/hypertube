let express = require('express');
let router = express.Router();

const 	Register = require('../controller/register.js'),
 		Form = require('../controller/signin.js'),
		Select = require('../model/select.js');

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

router.get('/active_account', (req, res) =>
{
	Register.activeAccount(req.query.token, (error, success) =>
	{
		if (error) {
			res.status(200).send(error);
		}
		else {
			res.redirect('/');
		}
	})
});

router.post('/signin', (req, res) =>
{
	if (req.body.username && req.body.password)
	{
		Form.checkSignIn(req.body, (err, success) =>
		{
			if (err)
				res.status(200).send(err);
			else
			{
				Select.getId(req.body.username, (error, success) =>
				{
					if (error) {
						res.status(200).send(error);
					}
					else
					{
						req.session.oauth = false;
						req.session.user_id = success;
						req.session.save();
						res.status(200).send('1');
					}
				})
				
			}
		})
	}
	else
		res.status(200).send("Données absente");
});

module.exports = router;
