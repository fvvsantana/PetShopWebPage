// configure the expres
let express = require('express');
let bodyParser = require("body-parser");
let app = express();
app.use(express.static(__dirname + '/client'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// open the MongoDB Client
var db;
var MongoClient = require('mongodb').MongoClient;
var uri = "mongodb+srv://admin:admin@happypet-aknaj.mongodb.net";
MongoClient.connect(uri, function(err, client) {
	if (err) throw err;
	db = client.db('petshop');
});

//initiate the SPA
app.get('/', (req, res)=>{
   res.sendFile('/client/index.html', {root: __dirname });
})

// receive requests for product details
app.get('/product', (req, res)=>{
	// find the product with the received id
	db.collection('products').findOne({_id: parseInt(req.query.id)}, function(err, result){
		if(err) throw err;
		// return the product object
		res.send(result);
	})
})

// receive requests for all products (products page)
app.get('/products', (req, res)=>{
	// find the products
	db.collection('products').find(req.query.product).toArray(function(err, result){
		if(err) throw err;
		// return the products
		res.send(result);
	});
});

//generate a sequence of ids for products
app.get('/product-id', (req, res)=>{
	db.collection('product-counter').findAndModify(
		{_id: 'product_id'},
		[],
		{$inc: {new_id: 1}},
		function(err, result){
			if(err) throw err;
			// return the product object
			res.send(result.value);
		}
	);
})

//request for adding new products (admin page)
app.post('/new-product', (req, res)=>{
	db.collection('products').insertOne(JSON.parse(req.body.product), function(err, result){
		if(err) {
			res.send({success: false});
			throw err;
		}
		res.send({success: true});
	});
});

//request for updating a product (admin page)
app.put('/product-modify', (req, res)=>{
  let modProduct = JSON.parse(req.body.product);
  console.log(modProduct);
  db.collection("products").updateOne({_id:modProduct._id}, { $set: modProduct }, function(err, result) {
  });
});

// requests for deleting products (admin page)
app.delete('/products', (req, res)=>{
	db.collection('products').deleteOne({_id: parseInt(req.body.id)}, function(err, obj) {
		if (err) throw err;
		res.send('');
	});
});

// receive requests for login
app.get('/login', (req, res)=>{
	// find the users
	db.collection('users').findOne(req.query.user, function(err, result){
		console.log(result);
		if(err) {
            return res.send({
                success: false,
                message: 'Erro ao pegar usuário!'
            });
		}
		// return the users
		res.send(result);
	});
});

// receive requests for users
app.get('/users', (req, res)=>{
	// find the users
	db.collection('users').find(req.query.user).toArray(function(err, result){
		console.log(result);
		if(err) {
            return res.send({
                success: false,
                message: 'Erro ao pegar usuário!'
            });
		}
		// return the users
		res.send(result);
	});
});

app.delete('/users', (req, res)=>{
	db.collection('users').deleteOne({cpf: req.body.id}, function(err, obj) {
		if (err) throw err;
		res.send('');
	});
});

//request for adding new users
app.post('/new-user', (req, res)=>{
	db.collection('users').insertOne(JSON.parse(req.body.user), function(err, result){
		if(err) {
            return res.send({
                success: false,
                message: 'Pessoa já cadastrada!'
            });
		}
		res.send({success: true});
	});
});


//request for adding new admins (admin page)
app.post('/new-admin', (req, res)=>{
	db.collection('users').insertOne(JSON.parse(req.body.admin), function(err, result){
		if(err) {
            return res.send({
                success: false,
                message: 'Pessoa já cadastrada!'
            });
		}
		res.send({success: true});
	});
});

// receive requests for pets (user page)
app.get('/pets', (req, res)=>{
	// find the pets of an user
	db.collection('pets').find({owner: req.query.id}).toArray(function(err, result){
		if(err) throw err;
		// return the pets
		res.send(result);
	});
});

// receive requests for all orders (admin page)
app.get('/orders', (req, res)=>{
	// find orders made
	db.collection('orders').find().toArray(function(err, result){
		if(err) throw err;
		// return the orders
		res.send(result);
	});
});

// receive requests for details of an order (user page)
app.get('/order', (req, res)=>{
	// find orders made
	db.collection('orders').find({_id: req.body.id}).toArray(function(err, result){
		if(err) throw err;
		// return the orders
		res.send(result);
	});
});

//initiate the server at port 3000
let server = app.listen(3000, ()=>{
   let host = server.address().address;
   let port = server.address().port;
   console.log("Happy Pet listening at port %s", port);
})
