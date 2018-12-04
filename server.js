    const express = require('express');
const app = express();
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const passport = require('./config/passport');
const { User } = require('./app/models');
const session = require('express-session');
const models = require('./app/models');
const isAuthenticated = require("./config/middleware/isAuthenticated");

const sess = {
    secret: "TeslaAndCiri",
    cookie: {}
};


const sequelize = new Sequelize('postgres', 'postgres', 'Robijn181', {
    host: 'localhost',
    dialect: 'postgres',
  
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  });
const PORT = 3000;


if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
  }

app.use(session(sess));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

//Sync Database
models.sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log("==> ?  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
      });
});


sequelize.authenticate()
.then(() => {console.log("Connection Succesfull!")})
.catch(err => {
    console.log("Unable to connect to the Database: ", err);
});

app.post('/register', (req,res) => {
    models.User.create({
        email: req.body.email,
        password: req.body.password
    }).then(() => {
        res.redirect(307, "/login");
    }).catch(err => {
        console.log(err);
        res.json(err);
    })
});

app.post("/login", passport.authenticate("local"), function(req, res) {
    res.redirect("/");
  });
app.get("/logout",(req, res) => {
    req.logout();
    res.redirect("/");
  });

app.get("/", isAuthenticated, (req, res) => {
    res.json(req.user);
});
app.get('/users', async(req,res) => {
    User.findAll().then(users => {res.json(users)}).catch(err => res.json(err));
})

app.get('/user/:id', async (req,res) => {
    User.findOne({where:{id: req.params.id}})
    .then(user => res.json(user))
    .catch(err => res.json(err))
})

app.get("/user_data", function(req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    }
    else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id
      });
    }
  });

app.put('/user/:id', async (req,res) => {
    User.update({name: req.body.name, email:req.body.email, password: req.body.password},
        {returning: true, where: {id: req.params.id}})
        .then(([rowsUpdated, [updatedUser]]) => res.json(updatedUser))
        .catch(err => res.json(err))
});

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);