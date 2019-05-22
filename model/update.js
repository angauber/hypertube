const	Models = require('../setup/schemas.js'),
		Users = Models.Users,
		TokenRegister = Models.TokenRegister,
		Forget_tokens = Models.Forget_tokens,
		Bcrypt = require('bcrypt'),
		SaltRounds = 8;

module.exports = 
{
	activeAccount(username, callback)
	{
		Users.updateOne({ username: username }, { $set: { isActive : true } }, (er, resp) =>
		{
			if (er)
				callback('Error update');
			else
				callback(null, 1);
		});
	},
}