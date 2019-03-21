var express = require('express')

var app = express()

var port = 3000

app.get('/', (req, res) => {
	res.status(200).send('<a href="/auth/google">Sign In with Google</a>')
})


app.listen(port, () => { console.log(`Listening on port ${port}`) })
