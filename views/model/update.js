const	Models = require('../setup/schemas.js'),
		Users = Models.Users,
		TokenRegister = Models.TokenRegister,
		Forget_tokens = Models.Forget_tokens,
		Bcrypt = require('bcrypt'),
		Select = require("./select.js")
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

	updateId(username, callback)
	{
		Select.getId(username, (error, success) =>
		{
			if (error)
				callback(error)
			else {
				Users.updateOne({ username : username }, { $set: { id : success } }, (er, resp) =>
				{
					if (er)
						callback('Error update');
					else
						callback(null, 1);
				});
			}
		})
	},

	updateEmail(email, id, callback)
	{
		Users.updateOne({ id : id }, { $set: { email : email.toLowerCase() } }, (er, resp) =>
		{
			if (er)
				callback('Error update email');
			else
				callback(null, 1);
		});
	},

	updateLogin(username, id, callback)
	{
		Users.updateOne({ id : id }, { $set: { username : username.toLowerCase() } }, (er, resp) =>
		{
			if (er)
				callback('Error update username');
			else
				callback(null, 1);
		});
	},

	updateFirstname(firstname, id, callback)
	{
		Users.updateOne({ id : id }, { $set: { firstName : firstname.toLowerCase() } }, (er, resp) =>
		{
			if (er)
				callback('Error update firstname');
			else
				callback(null, 1);
		});
	},

	updateLastname(lastname, id, callback)
	{
		Users.updateOne({ id : id }, { $set: { lastName : lastname.toLowerCase() } }, (er, resp) =>
		{
			if (er)
				callback('Error update lastname');
			else
				callback(null, 1);
		});
	},

	updatePicture(img, id, callback)
	{
		Users.updateOne({ id : id }, { $set: { img : img } }, (er, resp) =>
		{
			if (er)
				callback('Error update email');
			else
				callback(null, 1);
		});
	},

	password(password, email, callback)
	{
		Bcrypt.hash(password, SaltRounds, (err, hash) =>
		{
			Users.updateOne({ email : email }, { $set: { password : hash } }, (er, resp) =>
			{
				if (er)
					callback('Error update');
				else
					callback(null, 1);
			});
		});
	},

	passwordViaId(password, id, callback)
	{
		Bcrypt.hash(password, SaltRounds, (err, hash) =>
		{
			Users.updateOne({ id : id }, { $set: { password : hash } }, (er, resp) =>
			{
				if (er)
					callback('Error update Password');
				else
					callback(null, 1);
			});
		});
	},
}
