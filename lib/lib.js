const Token = require('rand-token');

module.exports =
{
	createToken()
	{
		return (Token.generate(16));
	}
}