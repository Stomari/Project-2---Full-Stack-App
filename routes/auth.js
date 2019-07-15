const express = require('express');
const passport = require('passport');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');
const User = require('../models/user');
const router = express.Router();
const bcryptSalt = 10;

router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

router.post('/signup', (req, res) => {
  const { username, firstName, surname, age, password, email, role } = req.body;

  if (username === '' || password === '' || email === '') {
    res.render('auth/signup', { message: 'Indicate username, password and email are required' });
    return;
  }

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
        name: firstName,
        surname,
        age,
        password: hashPass,
        email,
        role,
      });
      console.log(newUser)
      newUser.save((err) => {
        if (err) {
          res.render('auth/signup', { message: 'Something went wrong' });
        }
      });

      res.redirect('/');
    })
    .catch(err => console.log(err));
});

router.get('/login', ensureLoggedOut(), (req, res) => {
  res.render('auth/login', { message: req.flash('error') });
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true,
  passReqToCallback: true,
}), (req, res) => {
  if (req.user.firstTime) {
    res.redirect('/instruments');
  } else {
    res.redirect('/');
  }
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

module.exports = router;
