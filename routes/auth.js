const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();
const bcryptSalt = 10;

router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

router.post('/signup', (req, res) => {
  const { username, password, email, role } = req.body;

  if (username === '' || password === '' || email === '') {
    res.render('auth/signup', { message: 'Indicate username, password and email are required' });
    return;
  }

  console.log('teste ###################################', { username });

  User.findOne({ username })
    .then((user) => {
      if (user !== null) {
        res.render('auth/signup', { message: 'The username already exists' });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        username,
        password: hashPass,
        email,
        role,
      });

      newUser.save((err) => {
        if (err) {
          res.render('auth/signup', { message: 'Something went wrong' });
        }
      })
        .then((info) => {
          console.log(info);
          res.redirect('/');
        })
        .catch(error => console.log(error));
    })
    .catch(err => console.log(err));
});

module.exports = router;
