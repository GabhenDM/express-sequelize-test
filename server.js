const express = require('express');
const app = express();
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const { User } = require('./app/models');

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


app.use(bodyParser.urlencoded({ extended: false }));


sequelize.authenticate()
.then(() => {console.log("Connection Succesfull!")})
.catch(err => {
    console.log("Unable to connect to the Database: ", err);
});


app.post('/register', async (req,res) => {
    User.create(req.body).then(user => {res.json(user)}).catch(err => res.json(err));
    
})

app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
})