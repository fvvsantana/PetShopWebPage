let express = require('express');
let app = express();
app.use(express.static(__dirname + '/client'));

app.get('/', (req, res)=>{
   res.sendFile('/client/index.html', {root: __dirname });
})

let server = app.listen(3000, ()=>{
   let host = server.address().address;
   let port = server.address().port;
   console.log("Example app listening at http://%s:%s", host, port);
})