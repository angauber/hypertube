// Global Require part

const	mongoose = require('mongoose'),
		Schema = mongoose.Schema;

// module npm require part

require('mongoose-type-email');

let users = new mongoose.Schema(
{
	 	username : String,
		firstName : String,
		lastName : String,
		id : String,
		img : String,
		oauth : Number,
		email : mongoose.SchemaTypes.Email,
		password : String,
		language : { type : String, default : 'EN' },
		typeOfUser : { type : String, default : 'user' },
		isActive : { type : Boolean, default : false },
		banned : { type : Boolean, default : false },
		creationDate : { type: Date, default: Date.now },
		lastConnexion : { type: Date, default: Date.now },
});

let tokenRegister = new mongoose.Schema(
{
	token : String,
	username : String,
	creationDate : { type: Date, default: Date.now }
},
	{
    	versionKey: false
	}
);

let tokenForgetPassword = new mongoose.Schema(
{
	token : String,
	email : mongoose.SchemaTypes.Email,
	creationDate : { type: Date, default: Date.now }
},
	{
    	versionKey: false
	}
);

let Users = mongoose.model('Users', users),
	TokenRegister = mongoose.model('TokensRegister', tokenRegister),
	Forget_tokens = mongoose.model('Forget_tokens', tokenForgetPassword);

module.exports =
{
	Users : Users,
	TokenRegister : TokenRegister,
	Forget_tokens : Forget_tokens,
}

