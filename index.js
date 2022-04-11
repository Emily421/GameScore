const express = require('express')
app = express()
// MongoDB database - tutorial from https://www.mongodb.com/blog/post/quick-start-nodejs-mongodb-how-to-get-connected-to-your-database
const {MongoClient, Db} = require('mongodb');

async function getRandomWord(client){
  max = 4; //number of documents plus 1
  random = Math.floor(Math.random() * max);
  const randomdoc = await client.db("gamescore_words").collection("words").findOne({number: random});
  randomword = randomdoc.name;
}

async function main() {
	const uri = "mongodb+srv://gamescoreapplication:gamescore@gamescore.hhvnf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    // Call function
    await  getRandomWord(client);

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
main().catch(console.error);
//

var url = require('url');
const path = require('path');

const port = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'static'))

app.get('/',(request,response)=>{
    response.render('home.ejs', {randomword: randomword,})
})

app.get('/random', (request, response) => {
	console.log('Calling random word.')
	response.type('text/plain')
	response.send(randomword);
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
