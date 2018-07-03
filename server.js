// configure the expres
let express = require('express');
let app = express();
app.use(express.static(__dirname + '/client'));

// open the MongoDB Client
var db;
var MongoClient = require('mongodb').MongoClient;
var uri = "mongodb+srv://admin:admin@happypet-aknaj.mongodb.net";
MongoClient.connect(uri, function(err, client) {
	if (err) throw err;
	db = client.db('petshop');
});

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

let server = app.listen(3000, ()=>{
   let host = server.address().address;
   let port = server.address().port;
   console.log("Example app listening at http://%s:%s", host, port);
})