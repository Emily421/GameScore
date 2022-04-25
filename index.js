// if (process.env.NODE_ENV !== 'production') {
//  require('dotenv').config()
// }
const express = require('express')
app = express()
// MongoDB database - tutorial from https://www.mongodb.com/blog/post/quick-start-nodejs-mongodb-how-to-get-connected-to-your-database
randomword = "Default";
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
const { Server } = require('http');
// const nodemon = require('nodemon');
// const { restart } = require('nodemon');
const port = process.env.PORT || 3000
// const bcrypt = require('bcrypt')
// const passport = require('passport')
// const flash = require('express-flash')
// const session = require('express-session')
// const methodOverride = require('method-override')
// var userScore = 0

// const initializePassport = require('./passport-config');
// const { initialize } = require('passport');
// initializePassport(
//  passport, 
//  username => users.find(user => user.username === username),
//  id => users.find(user => user.id === id)
// )
const users = []

// app.use(flash())
// app.use(session({
//  secret: process.env.SESSION_SECRET,
//  resave: false,
//  saveUninitialized: false
// }))
// app.use(passport, initialize)
// app.use(passport.session())
// app.use(methodOverride('_method'))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'static'))
app.use(express.urlencoded({ extended: false }))

app.get('/', /*checkAuthenticated*/ (request,response)=>{
    response.render('home.ejs', {randomword: randomword, /*username: request.user.username, score: 0*/})
})

app.get('/login', /*checkNotAuthenticated,*/ (request, response) => {
  response.render('login.ejs')
})

// app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
//  successRedirect: '/',
//  failureRedirect: '/login',
//  failureFlash: true
// }))

// app.get('/register', checkNotAuthenticated, (request, response) => {
//  response.render('register.ejs')
// })
/*
app.post('/register', checkNotAuthenticated, async (request, response) => {
  try {
    const hashedPassword = await bcrypt.hash(request.body.password, 10)
    users.push({
      id: Date.now().toString(),
      username: request.body.username,
      password: hashedPassword
    })
    response.redirect('/login')
  } catch {
    response.redirect('/register')
  }
})
*/
app.get('/random', (request, response) => {
	console.log('Calling random word.')
	response.type('text/plain')
	response.send(randomword);
})

app.get('/proposal', (request, response) => {
	console.log('Calling proposal page on server.')
	response.render('proposal.ejs')
})

app.get('/reload', (request, response) => {
	main();
})

app.get('/help', (request, response) => {
  console.log('Calling instruction page on server.')
  response.render('help.ejs')
})

app.delete('/logout', (request, response) => {
  request.logOut()
  response.redirect('/login')
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


/*
function checkAuthenticated(request, response, next) {
  if (request.isAuthenticated()) {
    return next()
  }
  response.redirect('/login')
}

function checkNotAuthenticated(request, response, next) {
  if (request.isAuthenticated()) {
    return response.redirect('/')
  }
  next()
}
*/
app.listen(port, () => console.log(
  `Express started at \"http://localhost:${port}\"\n` +
  `press Ctrl-C to terminate.`)
)
