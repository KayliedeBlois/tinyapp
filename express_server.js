// Generate String with 6 random characters
function generateRandomString(length) {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}

const { response } = require("express");
//once new ID is generated, add to data base "id": longURL (key value pair)
const express = require("express");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const e = require("express");

const app = express();
const PORT = 8080; // default port 8080

// view engine setup
app.set("view engine", "ejs");

// Middlewares
app.use(express.urlencoded({ extended: true }));
//app.use(cookieParser());
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const {getUserByEmail} = require('./helpers'); 

const urlsForUser = function(id) {
  let storedURLs = [];

  Object.values(urlDatabase).some(function(url){
    if( id  === url.userID) {
      storedURLs.push(url.longURL);
    }
  });
  return storedURLs;
};

app.get("/urls", (req, res) => {

  console.log(req.session.user_id);
console.log(users);
  const templateVars = {user: users[req.session.user_id], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Homepage
app.get("/", (req, res) => {
    res.redirect('/login');
});

// app.post("/", (req, res) => {
//     res.redirect('/login');
// })


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


//My URLS page
app.get("/urls", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
})
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6)
  console.log(shortURL);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };

  res.redirect('/urls/' + shortURL);
});

//Create new URL Page
app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};

  if (req.session.user_id === undefined) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

//Short URL - redirecting to long URL site when clicked
app.get("/u/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL); 
});

//URLS ID page GET/PUSH & Functionality 
app.get("/urls/:id", (req, res) => {
  let long = '';

  if (urlDatabase[req.params.id] !== undefined) {
    long = urlDatabase[req.params.id].longURL;
  }
  console.log(long);
  if (req.session.user_id === undefined) {
    res.send('400 Error: Not logged in')
  }

  if (getUserByEmail(req.params.id, users) === []) {
    res.send('400 Error: URL does not belong to you')
  } 

  const templateVars = { user: users[req.session.user_id], id: req.params.id, longURL: long, urls: urlDatabase };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {

  if (req.params.id === undefined) {
    res.send('403 Error: ShortURL does not exist');
  }

  if (req.session.user_id === undefined) {
    res.send('403 Error: User not logged in');
  }

  if (urlsForUser(req.params.id) === []) {
    res.send('403 Error: URL does not belong to you');
  }

  const id = req.params.id;

  urlDatabase[id].longURL = req.body.longURL
  res.redirect('/urls/' + id);
});

app.post("/urls/:id/delete", (req, res) => {

  if (req.params.id === undefined) {
    res.send('403 Error: ShortURL does not exist');
  }

  if (req.session.user_id === undefined) {
    res.send('403 Error: User not logged in');
  }

  if (urlsForUser(req.params.id) === []) {
    res.send('403 Error: URL does not belong to you');
  }
  
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});



//Registration Page GET/PUSH
app.get("/register", (req, res) => {
console.log(req.session.user_id);
  if (req.session.user_id !== undefined) {
    res.redirect('/urls/');
  } 
    res.render("urls_register");
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.send('400 Error: No input provided')
  } 

  if (getUserByEmail(req.body.email, users) !== null) {
    res.send('400 Error: Email is taken')
  }  

  let user = generateRandomString(8);
  req.session.user_id = user
  // res.cookie('user_id', user);
 
  users[user] = {
    id: user,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }

  res.redirect('/urls/');
});


//Login Page GET/PUSH
app.get("/login", (req, res) => {
  if (req.session.user_id === undefined) {
    res.render("urls_login");
  } 
  res.redirect('/urls/');
});

app.post("/login", (req, res) => {

  let user = getUserByEmail(req.body.email, users);

  if (getUserByEmail(req.body.email, users) === null) {
    res.send('403 Error: User does not exist')
  }

  if (getUserByEmail(req.body.email, users) !== null && (!bcrypt.compareSync(req.body.password, user.password))) {
    res.send('403 Error: Incorrect password')
  }

  req.session.user_id = user.id
  res.redirect('/urls/');
});


//Logout GET/PUSH
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});