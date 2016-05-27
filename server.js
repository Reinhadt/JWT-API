//BASE SETUP
//=====================================

//CALL THE PACKAGES --------------------
var express	= require('express');
var app		= express();
var bodyParser	= require('body-parser');
var morgan	= require('morgan');
var mongoose	= require('mongoose');
var port	= process.env.PORT || 3000;

var User	= require('./app/models/user');

//APP CONFIGURATION --------------------
//Use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({ extended: true}));

//configure our app to hadle CORS requests
app.use(function(req, res, next){
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, \ Authorization');
	next();
});

//log requests to our console
app.use(morgan('dev'));

//connect to our database
mongoose.connect('mongodb://localhost:27017/crm');

//ROUTES FOR OUR API
//=======================================

//basic route for home page
app.get('/', function(req, res){
	res.send('WELCOME TO LOCALHOST!');
});

//Get an instance of the express router
var apiRouter = express.Router();

//Route middleware
apiRouter.use(function(req, res, next){
	//logging
	console.log('Somebody came to our api');

	next();
});

//test route to make sure everything is working
//accessed  at GET http://localhost:3000/api
apiRouter.get('/', function(req, res){
	res.json({ message: 'HEY! Welcome to our api' });
});


apiRouter.route('/users')
	//create a user (POST)
	.post(function(req, res){
		
		var user = new User();
		
		//set the info from request
		
		user.name = req.body.name;
		user.username = req.body.username;
		user.password = req.body.password;
		
		//save the user and check for errors
		user.save(function(err){
			if(err){
				//duplicate entry
				if(err.code == 11000){
					return res.json({ success: false, message:'A user with that username already exist' });
				}
					
				else{
					return res.send(err);
				}
			}

			res.json({ message:'User created!' });

		}); 
	})

	.get(function(req, res){
		User.find(function(err, users){
			if(err) res.send(err);

			//return all users
			res.json( users );

		})
	});

apiRouter.route('/users/:user_id')
	.get(function(req, res){

		User.findById( req.params.user_id, function(err, user){
			if(err){
				res.send(err);
			}
			else{

				res.json(user);

			}
		})
	})	

	.put(function(req, res){
		//use our model to find the user we want
		User.findById( req.params.user_id, function(err, user){

			if(err){
				res.send(err);
			}
			//update the user's info only if its new
			if(req.body.name){
				user.name = req.body.name;
			}
			if(req.body.username){
				user.username = req.body.username;
			}
			if(req.body.password){
				user.password = req.body.password;
			}

			//save the user

			user.save(function(err){
				if(err){ res.send(err) }

				res.json({ message: 'User updated!' });

			})
		})
	})

//REGISTER THE ROUTES
//All our routes will be prefixed with /api
app.use('/api', apiRouter);

//START THE SERVER
//=========================================

app.listen(port);
console.log('Magic happens on ' + port);
