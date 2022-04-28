 
const express               = require('express')
const app = express()
// MongoDB database - tutorial from https://www.mongodb.com/blog/post/quick-start-nodejs-mongodb-how-to-get-connected-to-your-database
randomword = "Default";
const {MongoClient, Db}     = require('mongodb');
const path                  = require('path');
const { Server }            = require('http');
const nodemon               = require('nodemon');
const { restart }           = require('nodemon');
const { cursorTo }          = require('readline');
const { stringify }         = require('querystring');
const port                  = process.env.PORT || 3000
// Authentication Dependencies

const bcrypt                = require('bcryptjs'); // BREAKS SITE
const passport              = require('passport');    // This does not cause issue
const hbs                   = require('express-handlebars')
const session               = require('express-session'); // No
const mongoose              = require('mongoose');
const LocalStrategy         = require('passport-local').Strategy;

var fs = require('fs')

mongoose.connect("mongodb+srv://gamescoreapplication:gamescore@gamescore.hhvnf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
  // Need to implement score in here somehow
})

const User = mongoose.model('User', UserSchema)

// Middleware
app.engine('hbs', hbs.engine({ extname: '.hbs' }))
app.set('view engine', 'hbs')
app.use(express.static(__dirname + '/public'))
app.use(session({
  secret: "verygoodsecret",
  resave: false,
  saveUninitialized: true
}))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Passport.js
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  // Setup user model
  User.findById(id, function (err, user) {
    done(err, user)
  })
})

passport.use(new LocalStrategy(function (username, password, done) {
  User.findOne({ username: username }, function(err, user) {
    if (err) { return done(err) } 
    if (!user) return done(null, false, {message: 'Incorrect Username'}) 
    bcrypt.compare(password, user.password, function (err, res) {
      if (err) return done(err) 
      if (res === false) return done(null, false, { message: 'Incorrect Password. '})
      return done(null, user)    
    })
  })
}))

function isLoggedIn(request, response, next) {
  if (request.isAuthenticated()) return next()
  response.redirect('/login')
}
function isLoggedOut(request, response, next) {
  if (!request.isAuthenticated()) return next()
  response.redirect('/')
}

var userScore = 0
async function getRandomWord(client){
  max = 60
  random = Math.floor(Math.random() * max);
  const randomdoc = await client.db("gamescore_words").collection("word_list").findOne({number: random.toString()});
  const randomdocword = JSON.stringify(randomdoc);
  var words = randomdocword.split(",");
  max2 = 54
  random2 = Math.floor(Math.random() * max2);
  lines = words[random2];
  var threes = lines.split(" ")
  twos = threes[1]
  twos = twos.replaceAll('"', '')
  twos = twos.replaceAll('\\', '')
  randomword = twos;
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
const { fstat } = require('fs');

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'static'))
app.use(express.urlencoded({ extended: false }))

// ROUTES
app.get('/login', isLoggedOut, (request, response) => {
  const res = {
    title: "Login",
    error: request.query.error
  }
  response.render('login', res)
})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login?error=true' 
}))

app.get('/logout', function (request, response) {
  request.logout()
  response.redirect('/')
})

app.get('/register', (request, response) => {
  fs.readFile(__dirname + '/static/register.ejs', function(err, data) {
    response.writeHead(200, {'Content-Type': 'text/html'})
    response.write(data)
    return response.end()
  })
})

app.post('/register/done', async (request, response) => {
  const exists = await User.exists({ username: request.body.username })
  if (exists) {
    response.send("Username already in use.")
    response.redirect('/login')
    return
  }
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err)
    bcrypt.hash(request.body.password, salt, function (err, hash) {
      if (err) return next(err)
      const newAdmin = new User({
        username: request.body.username,
        password: hash
      })
      newAdmin.save()
      response.redirect('/login')
    })
  })
})

app.get('/', isLoggedIn, (request,response)=> {
  response.render('home.ejs', {randomword: randomword})
    
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

app.get('/reload', (request, response) => {
	main();
})

app.get('/help', (request, response) => {
  console.log('Calling instruction page on server.')
  response.render('help.ejs')
})

app.get('/contact', (request, response) => {
  console.log('Calling contact form on server')
  response.render('contact.ejs')
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
    response.render('home.ejs');
})






app.listen(port, () => console.log(
  `Express started at \"http://localhost:${port}\"\n` +
  `press Ctrl-C to terminate.`)
)
