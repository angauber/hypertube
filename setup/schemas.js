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

let Users = mongoose.model('Users', users);

module.exports =
{
	Users : Users,
}