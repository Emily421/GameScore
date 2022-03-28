const express = require('express')
app = express()

var url = require('url');
const path = require('path');

const port = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'static'))

app.get('/',(request,response)=>{
    response.render('home.ejs')
})

app.get('/random', (request, response) => {
	console.log('Calling Random on Node server.')
	response.type('text/plain')
	response.send('Random word.')
})

app.get('/proposal', (request, response) => {
	console.log('Calling proposal page on server.')
	response.render('proposal.ejs')
})

// Custom 404 page.
app.use((request, response) => {
  response.type('text/plain')
  response.status(404)
  response.send('404 - Not Found')
})

// Custom 500 page.
app.use((err, request, response, next) => {
  console.error(err.message)
  response.type('text/plain')
  response.status(500)
  response.send('500 - Server Error')
})

app.post('/',(require,response)=>{
    response.render('index.ejs');
})

app.listen(port, () => console.log(
  `Express started at \"http://localhost:${port}\"\n` +
  `press Ctrl-C to terminate.`)
)
