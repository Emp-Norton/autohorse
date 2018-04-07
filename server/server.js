let express = require('express');
let app = express();
let path = require('path');

app.use(express.static(__dirname + '/../public'))

app.get('/', (req, res) => {
	 res.sendFile(path.join(__dirname + '/../public/autohorse.html'))
})


app.set('port', process.env.PORT || 3000);
app.listen(port, function() {
	console.log('listening on 3000');
})