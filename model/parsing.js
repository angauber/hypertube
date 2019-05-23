module.exports =
{
	validUsername(str, callback)
	{
		let strLen = str.length;
		if (str != undefined && (strLen >= 2 && strLen <= 16) && /^[a-zA-Z]+$/.test(str))
		{
			callback(null, 1);
		}
		else
			callback("Error in name");
	},

	validLogin(str, callback)
	{
		let strLen = str.length;
		if (str != undefined && (strLen >= 2 && strLen <= 16) && /^[a-z0-9]+$/.test(str))
		{
			callback(null, 1);
		}
		else
			callback("Error in name");
	},

	validEmail(email, callback)
	{
		email = String(email.toLowerCase().trim());
		email.match(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i) ? callback(null, 1) : callback('Error email');
	},

	validPassword(pwd, callback)
	{
		let u = String(pwd);
		if (u.length >= 8)
		{
			let number = 0,
				letter = 0;
			for (let i = 0; i < u.length; i++)
			{
				if ((u.charCodeAt(i) >= 33 && u.charCodeAt(i) < 48)
					|| (u.charCodeAt(i) >= 58 && u.charCodeAt(i) <= 126))
						letter++;
				else if (u[i] >= 0 && u[i] <= 9)
					number++;
				else if (u[i] == ' ')
					callback('Error password');
				if (i >= (u.length - 1))
				{
					if (number >= 2)
						callback(null, 1)
					else
						callback('Error password')
				}
			}
		}
		else
			callback('Error password');
	},

	validLanguage(langue, callback)
	{
		if (langue == 'fr' || langue == 'en' || langue == 'es' || langue == 'de')
			callback(null, 1);
		else
			callback('Error language');
	}
}