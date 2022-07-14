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
const e = require("express");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  }
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

app.get("/urls", (req, res) => {
  const templateVars = {user: users[req.cookies.user_id], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies.user_id]};
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id], id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6)
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls/' + shortURL);
});

app.get("/u/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  res.redirect('/urls/' + id);
});

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL
  res.redirect('/urls/' + id);
});

// app.post("/login", (req, res) => {
//   res.redirect('/urls/');
// });

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls/');
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.send('400 Error: No input provided')
  } 

  if (userLookup(req.body.email) !== null) {
    //console.log('email taken');
    res.send('400 Error: Email is taken')
  }  

  let user = generateRandomString(8);
  res.cookie('user_id', user);
 
  users[user] = {
    id: user,
    email: req.body.email,
    password: req.body.password
  }

  res.redirect('/urls/');
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  let user = userLookup(req.body.email);
  res.cookie('user_id', user.id);
  res.redirect('/urls/');
});