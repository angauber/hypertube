let express = require('express');
let router = express.Router();

const 	Register = require('../controller/register.js'),
 		Form = require('../controller/signin.js'),
		Parsing = require('../model/parsing'),
		Update = require('../model/update.js')
		Select = require('../model/select.js');

router.post('/comment', (req, res) =>
{
});

router.post('/register', (req, res) =>
{
	if (req.body.email !== 'undefined' && req.body.username !== 'undefined' && req.body.firstName !== 'undefined' && req.body.lastName !== 'undefined' && req.body.password !== 'undefined' && req.body.confirmPassword !== 'undefined' && req.body.language !== 'undefined')
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
	}
	else
	{
		res.status(200).send('Erreur data');
	}
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

router.post('/forget', (req, res) =>
{
	if (req.body.email !== 'undefined') {
		Register.forgetPassword(req.body.email, (error, success) =>
		{
			if (error) {
				res.status(200).send(error);
			}
			else {
				res.status(200).send('1');
			}
		})
	}
	else {
		res.status(200).send('Erreur data');
	}
});

router.post('/update-email', (req, res) =>
{
	if (req.session.user_id && req.body.email != null && req.body.email != 'undefined')
	{
		Parsing.validEmail(req.body.email, (errParse, successParse) =>
		{
			if (errParse) {
				res.status(200).send(errParse);
			}
			else {
				Select.isEmail(req.body.email, (errIs, successIs) =>
				{
					if (errIs) {
						res.status(200).send(errIs);
					}
					else if (successIs == 0) {
						Update.updateEmail(req.body.email, req.session.user_id, (errEmail, successEmail) =>
						{
							if (errEmail) {
								res.status(200).send(errEmail);
							}
							else {
								res.status(200).send('1');
							}
						})
					}
					else {
						res.status(200).send('Email already exists');
					}
				})
			}
		})
	}
	else {
		res.status(200).send('Oups, erreur de connexion ou data manquante');
	}
});

router.post('/update-password', (req, res) =>
{
	if (req.session.user_id && req.body.password != null && req.body.password != 'undefined' && req.body.cpassword != null && req.body.cpassword != 'undefined' && req.body.oldPassword != null && req.body.oldPassword != 'undefined' && req.body.password == req.body.cpassword)
	{
		Parsing.validPassword(req.body.password, (errParse, successParse) =>
		{
			if (errParse) {
				res.status(200).send(errParse);
			}
			else {
				Select.isPasswordViaId(req.session.user_id, req.body.oldPassword, (errPwd, successPwd) =>
				{
					if (errPwd) {
						res.status(200).send(errPwd);
					}
					else {
						Update.passwordViaId(req.body.password, req.session.user_id, (errIs, successIs) =>
						{
							if (errIs) {
								res.status(200).send(errIs);
							}
							else {
								res.status(200).send('1');
							}
						})
					}
				})
			}
		})
	}
	else {
		res.status(200).send('Oups, erreur de connexion ou data manquante');
	}
});

router.post('/update-picture', (req, res) =>
{
	if (req.session.user_id && req.body.picture != null && req.body.picture != 'undefined' && (req.body.picture == '1' || req.body.picture == '2'))
	{
		let img;
		if (req.body.picture == '1')
			img = 'https://www.reseau-immd.fr/wp-content/uploads/2017/10/if_users-10_984119.png';
		else
			img = 'https://www.reseau-immd.fr/wp-content/uploads/2017/10/if_users-3_984116.png'
		Update.updatePicture(img, req.session.user_id, (errUpdate, successUpdate) =>
		{
			if (errUpdate) {
				res.status(200).send(errUpdate);
			}
			else {
				res.status(200).send('1');
			}
		})
	}
	else {
		res.status(200).send('Oups, erreur de connexion ou data manquante');
	}
});

router.post('/update-username', (req, res) =>
{
	if (req.session.user_id && req.body.username != null && req.body.username != 'undefined')
	{
		Parsing.validLogin(req.body.username, (errLogin, successLogin) =>
		{
			if (errLogin) {
				res.status(200).send(errLogin);
			}
			else {
				Select.isLogin(req.body.username, (errIsLog, successIsLog) =>
				{
					if (errIsLog) {
						res.status(200).send(errIsLog);
					}
					else if (successIsLog == '1') {
						res.status(200).send('Login exist');
					}
					else {
						Update.updateLogin(req.body.username, req.session.user_id, (errUpdate, successUpdate) =>
						{
							if (errUpdate) {
								res.status(200).send(errUpdate);
							}
							else {
								res.status(200).send('1');
							}
						})
					}
				})
			}
		})
	}
	else {
		res.status(200).send('Oups, erreur de connexion ou data manquante');
	}
});

router.post('/update-firstname', (req, res) =>
{
	if (req.session.user_id && req.body.firstName != null && req.body.firstName != 'undefined')
	{
		Parsing.validUsername(req.body.firstName, (errLogin, successLogin) =>
		{
			if (errLogin) {
				res.status(200).send(errLogin);
			}
			else {
				Update.updateFirstname(req.body.firstName, req.session.user_id, (errUpdate, successUpdate) =>
				{
					if (errUpdate) {
						res.status(200).send(errUpdate);
					}
					else {
						res.status(200).send('1');
					}
				})
			}
		})
	}
	else {
		res.status(200).send('Oups, erreur de connexion ou data manquante');
	}
});

router.post('/update-lastname', (req, res) =>
{
	if (req.session.user_id && req.body.lastName != null && req.body.lastName != 'undefined')
	{
		Parsing.validUsername(req.body.lastName, (errLogin, successLogin) =>
		{
			if (errLogin) {
				res.status(200).send(errLogin);
			}
			else {
				Update.updateLastname(req.body.lastName, req.session.user_id, (errUpdate, successUpdate) =>
				{
					if (errUpdate) {
						res.status(200).send(errUpdate);
					}
					else {
						res.status(200).send('1');
					}
				})
			}
		})
	}
	else {
		res.status(200).send('Oups, erreur de connexion ou data manquante');
	}
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
	if ((req.body.password && req.body.confirmPassword) && (req.body.password == req.body.confirmPassword) && req.session.email !== 'undefined')
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
	if (req.body.username !== 'undefined' && req.body.password !== 'undefined')
	{
		Form.checkSignIn(req.body, (err, success) =>
		{
			if (err) {
				res.status(200).send(err);
			}
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
								req.session.oauth = 0;
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
