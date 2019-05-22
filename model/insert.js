const	Models = require('../setup/schemas.js'),
		randtoken = require('rand-token'),
		TokenRegister = Models.TokenRegister,
		// Forget_tokens = Models.Forget_tokens,
		Users = Models.Users;

module.exports =
{
	insertToken(username, token, callback)
	{
		let TokenCollection = new TokenRegister({
			username : username,
			token : token
		}).save((err, res) =>
		{
			if (err) callback('Error insert Token');
			else
				callback(null, 1);
		});
	},

	getTokenRegister(username, callback)
	{
		TokenRegister.find({ username : username }, (err, toks) =>
		{
			if (err) callback(err);
			if (toks[0])
				callback(null, toks[0].token);
			else
				error(null, 0);
		});
	},
}