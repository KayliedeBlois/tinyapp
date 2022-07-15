// Generate String with 6 random characters
function generateRandomString(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}

const { response } = require("express");
//once new ID is generated, add to data base "id": longURL (key value pair)
const cookieParser = require("cookie-parser");
const express = require("express");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080; // default port 8080

// view engine setup
app.set("view engine", "ejs");

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  // previously
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com"
};

const users = {
  // aJ48lW: {
  //   id: "aJ48lW",
  //   email: "user@example.com",
  //   password: "purple-monkey-dinosaur"
  // },
  // user2RandomID: {
  //   id: "user2RandomID",
  //   email: "user2@example.com",
  //   password: "dishwasher-funk"
  // }
};

const userLookup = function(email) {

  let emailExists;
  let storedUser;

  Object.values(users).some(function(user) {
    if(user.email === email) {
      emailExists = true;
      storedUser = user;
    }
  });

  if(emailExists) {
    return storedUser;
  }
  return null;
};

const urlsForUser = function(id) {

  let storedURLs = [];

  Object.values(urlDatabase).some(function(url){
    if( id  === url.userID) {
      storedURLs.push(url.longURL)
    }
  });
  return storedURLs;
};




app.get("/urls", (req, res) => {
  const templateVars = {user: users[req.cookies.user_id], urls: urlDatabase };
  res.render("urls_index", templateVars);
  console.log(req.cookies.user_id);

});


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//console.log(urlDatabase[fLViCN]);

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id === undefined) {
    res.redirect('/urls/');
  }
  const templateVars = {user: users[req.cookies.user_id]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let long = '';

  if (urlDatabase[req.params.id] !== undefined) {
    long = urlDatabase[req.params.id].longURL;
  }
  console.log(long);
  if (req.cookies.user_id === undefined) {
    res.send('400 Error: Not logged in')
  }

  if (userLookup(req.params.id) === []) {
    res.send('400 Error: URL does not belong to you')
  } 


  const templateVars = { user: users[req.cookies.user_id], id: req.params.id, longURL: long, urls: urlDatabase };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6)
  console.log(shortURL);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };

  res.redirect('/urls/' + shortURL);
});

app.get("/u/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
   
});

app.post("/urls/:id/delete", (req, res) => {

  if (req.params.id === undefined) {
    res.send('403 Error: ShortURL does not exist');
  }

  if (req.cookies.user_id === undefined) {
    res.send('403 Error: User not logged in');
  }

  if (urlsForUser(req.params.id) === []) {
    res.send('403 Error: URL does not belong to you');
  }
  
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

// app.post("/urls/:id", (req, res) => {
//   const id = req.params.id;
//   res.redirect('/urls/' + id);
// });

app.post("/urls/:id", (req, res) => {

  if (req.params.id === undefined) {
    res.send('403 Error: ShortURL does not exist');
  }

  if (req.cookies.user_id === undefined) {
    res.send('403 Error: User not logged in');
  }

  if (urlsForUser(req.params.id) === []) {
    res.send('403 Error: URL does not belong to you');
  }

  const id = req.params.id;
  urlDatabase[id] = req.body.longURL
  res.redirect('/urls/' + id);
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls/');
});

app.get("/register", (req, res) => {
  if (req.cookies.user_id !== undefined) {
    res.redirect('/urls/');
  }
  res.render("urls_register");
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.send('400 Error: No input provided')
  } 

  if (userLookup(req.body.email) !== null) {
    res.send('400 Error: Email is taken')
  }  

  let user = generateRandomString(8);
  res.cookie('user_id', user);
 
  users[user] = {
    id: user,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }

  res.redirect('/urls/');
});

app.get("/login", (req, res) => {
  if (req.cookies.user_id !== undefined) {
    res.redirect('/urls/');
  }
  res.render("urls_login");
});

app.post("/login", (req, res) => {


  let user = userLookup(req.body.email);

  if (userLookup(req.body.email) === null) {
    res.send('403 Error: User does not exist')
  }

  if (userLookup(req.body.email) !== null && (!bcrypt.compareSync(req.body.password, user.password))) {
    res.send('403 Error: Incorrect password')
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls/');
 
});