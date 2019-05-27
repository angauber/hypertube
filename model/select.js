const	Models = require('../setup/schemas.js'),
		Users = Models.Users,
		TokenRegister = Models.TokenRegister,
		Forget_tokens = Models.Forget_tokens,
		Bcrypt = require('bcrypt'),
		SaltRounds = 8;

module.exports = 
{
	isLogin(username, callback)
	{
		Users.where({ 'username' : username }).countDocuments((err, count) =>
		{
			if (err)
				callback('Username error');
			else if (count > 0)
				callback(null, 1);
			else
				callback(null, 0);
		})
	},

	isEmail(email, callback)
	{
		Users.where({ 'email' : email }).countDocuments((err, count) =>
		{
			if (err)
				callback('Username error');
			else if (count > 0)
				callback(null, 1);
			else
				callback(null, 0);
		})
	},

	isPassword(username, password, callback)
	{
		Users.find({ username : username }, (err, ret) =>
		{
			if (err)
				callback(0);
			else if (ret)
				Bcrypt.compare(password, ret[0].password, function(err, res)
				{
					if (err)
						callback("ERROR BCRYPT")
					else if (res == true)
						callback(null, 1);
					else
						callback('Mauvais Password');
				});
			else
				callback(null, 0);
		})
	},

	isToken(token, callback)
	{
		TokenRegister.where({ 'token' : token }).countDocuments((err, count) =>
		{
			if (err)
				callback('Username error');
			else if (count > 0)
				callback(null, 1);
			else
				callback(null, 0);
		})
	},

	getEmailByToken(token, callback)
	{
		Forget_tokens.find({ token : token }, (err, ret) =>
		{
			if (err)
				callback(0);
			else if (ret)
				callback(null, ret[0].email);
			else
				callback(0);
		});
	},

	getLoginByToken(token, callback)
	{
		TokenRegister.find({ token : token }, (err, ret) =>
		{
			if (err)
				callback(0);
			else if (ret)
				callback(null, ret[0].username);
			else
				callback(0);
		});
	},

	getLoginByTokenPwd(token, callback)
	{
		Forget_tokens.find({ token : token }, (err, ret) =>
		{
			if (err)
				callback(0);
			else if (ret)
				callback(null, ret[0].username);
			else
				callback('Nobody');
		});
	},

	getLoginByEmail(email, callback)
	{
		Users.find({ email : email }, (err, ret) =>
		{
			if (err)
				callback(0);
			else if (ret[0])
				callback(null, ret[0].username);
			else
				callback('Nobody exist with that token');
		});
	},

	getId(username, callback)
	{
		Users.find({ username : username }, (err, ret) =>
		{
			if (err)
				callback('Erreur getID');
			else if (ret)
				callback(null, ret[0]._id);
			else
				callback("Cette utilisateur n'existe pas");
		});
	},

	isActive(username, callback)
	{
		Users.find({ username : username }, (err, ret) =>
		{
			if (err)
				callback(0);
			else if (ret)
			{
				if (ret[0].isActive == true) {
					callback(null, 1);
				}
				else {
					callback("Confirm your account");
				}
			}
			else
				callback(0);
		});
	}
}