const 	Parsing = require('../model/parsing.js'),
		Models = require('../setup/schemas'),
		Users = Models.Users,
		SaltRounds = 8,
		Bcrypt = require('bcrypt');

module.exports =
{
	parseForm(body, callback)
	{
		if (body.password === body.confirmPassword)
			Parsing.validLogin(body.username, (err, successLogin) =>
			{
				if (err)
					callback("Login error");
				else
					Parsing.validUsername(body.firstName, (err, successFirstName) =>
					{
						if (err)
							callback("Firstname error");
						else 
							Parsing.validUsername(body.lastName, (err, successLastName) =>
							{
								if (err)
									callback("Lastname error");
								else 
									Parsing.validEmail(body.email, (err, successEmail) =>
									{
										if (err)
											callback("Email error");
										else 
											Parsing.validPassword(body.password, (err, successPassword) =>
											{
												if (err)
													callback(err);
												else
													Parsing.validLanguage(body.language, (err, successLanguage) =>
													{
														if (err)
															callback(err);
														else
														{
															this.insertUser(body, (errInsert, successInsert) =>
															{
																if (errInsert) {
																	callback(errInsert);
																}
																else {
																	callback(null, 1);
																}
															})
															
														}
													})
													
													// Select.isLogin(body.login, (errLogin, successLogin) =>
													// {
													// 	if (errLogin)
													// 		callback(errLogin);
													// 	else if (successLogin == 0)
													// 		Select.isEmail(body.email, (errEmail, successEmail) =>
													// 		{
													// 			if (errEmail)
													// 				callback(errEmail);
													// 			else if (successEmail == 0)
													// 			{
													// 				Bcrypt.genSalt(saltRounds, (errHash, salt) =>
													// 				{
													// 				    Bcrypt.hash(body.password, salt, (errHash, hash) =>
													// 					{
													// 						if (errHash)
													// 							callback("Error Password")
													// 						else
													// 						{
													// 							body.lastName = body.lastName.toLowerCase();
													// 							body.firstName = body.firstName.toLowerCase();
													// 							body.login = body.login.toLowerCase();
													// 							body.email = body.email.toLowerCase();
													// 							body.password = hash;
													// 							Insert.insertUser(body, (errInsert, successInsert) =>
													// 							{
													// 								if(errInsert)
													// 									callback(errInsert);
													// 								else
													// 									Insert.insertToken(body.login, (errToken, successToken) =>
													// 									{
													// 										if (errToken)
													// 											callback(errToken);
													// 										else
													// 											Email.accountConfirmationMail(body.email, successToken, (errMail, successMail) =>
													// 											{
													// 												if(errMail)
													// 													callback(errMail);
													// 												else
													// 													callback(null, '1');
													// 											})
													// 									})
													// 							});
													// 						}
													// 				    });
													// 				});
													// 			}
													// 			else
													// 				callback('L\'email existe deja');
													// 		})
													// 	else
													// 		callback('Le login existe deja');
													// })
											})
									})
							})
					})
			})
		else
			callback("Les mots de passe sont differents")
	},

	insertUser(body, callback)
	{
		Bcrypt.hash(body.password, SaltRounds, (err, hash) =>
		{
				let userInsert = new Users({
				 	username : body.username,
					firstName : body.firstName,
					lastName : body.lastName,
					img : body.picture,
					oauth : '0',
					email : body.email,
					password : hash,
					language : body.language,
					typeOfUser : 'user',
					isActive : false,
					banned : false,
				});
				userInsert.save((err, res) =>
				{
					if (res)
						callback(null, 1);
					else
						callback('Error insert user');
				});
		});
	}
}