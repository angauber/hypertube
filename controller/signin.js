const 	Parsing = require('../model/parsing.js'),
		Models = require('../setup/schemas'),
		Users = Models.Users,
		SaltRounds = 8,
		Bcrypt = require('bcrypt'),
		Select = require('../model/select.js'),
		Insert = require('../model/insert.js'),
		Update = require('../model/update.js'),
		Email = require('../model/email.js'),
		Lib = require('../lib/lib.js')

module.exports =
{
	checkSignIn(body, callback)
	{
		Parsing.validLogin(body.username, (err, successLogin) =>
		{
			if (err)
				callback("Erreur username");
			else
				Parsing.validPassword(body.password, (errPassword, successPassword) =>
				{
					if (errPassword)
						callback("Erreur mot de passe, 8 caracteres, 2 lettres obligatoires");
					else
					{
						Select.isLogin(body.username, (errLog, successLog) =>
						{
							if (errLog)
								callback(errLog);
							else if (successLog == 0) {
								callback("Le username n'existe pas");
							}
							else
								Select.isPassword(body.username, body.password, (errPass, successPass) =>
								{
									
									if (errPass)
										callback(errPass)
									else if (successPass == 0)
										callback("Mauvais mot de passe");
									else
										callback(null, '1');
								})
						})
					}
				})
		})
	},
}