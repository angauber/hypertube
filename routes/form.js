let express = require('express');
let router = express.Router();

const 	Register = require('../controller/register.js'),
 		Form = require('../controller/signin.js'),
		Parsing = require('../model/parsing'),
		Update = require('../model/update.js')
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
			res.status(200).send('1');
		}
	})
});

router.post('/forget', (req, res) =>
{
	Register.forgetPassword(req.body.email, (error, success) =>
	{
		if (error) {
			res.status(200).send(error);
		}
		else {
			res.status(200).send('1');
		}
	})
});


router.get('/change-password', (req, res) =>
{
	Select.getEmailByToken(req.query.token, (error, success) =>
	{
		if (error) {
			res.status(200).send(error);
		}
		else {
			req.session.email = success;
			res.render('change-password.ejs');
		}
	})
});

router.post('/change-password', (req, res) =>
{
	if ((req.body.password && req.body.confirmPassword) && req.body.password == req.body.confirmPassword && req.session.email)
	{
		Parsing.validPassword(req.body.password, (errorPwd, successPwd) =>
		{
			if (errorPwd)
				res.status(200).send(errorPwd);
			else
				Update.password(req.body.password, req.session.email, (error, success) =>
				{
					if (error) {
						res.status(200).send(error);
					}
					else {
						res.status(200).send('1');
					}
				})
		})
	}
	else {
		res.status(200).send('Erreur, vous n\'avez pas cliqué sur le bon mail ou vos donnés ne sont pas compatibles');
	}
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
						Select.isActive(req.body.username, (errActive, successActive) =>
						{
							if (errActive) {
								res.status(200).send(errActive);
							}
							else {
								req.session.oauth = false;
								req.session.user_id = success;
								req.session.save();
								res.status(200).send('1');
							}
						})
					}
				})
				
			}
		})
	}
	else
		res.status(200).send("Données absente");
});

module.exports = router;
