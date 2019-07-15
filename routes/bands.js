const express = require('express');
const passport = require('passport');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');
const User = require('../models/user');
const Band = require('../models/band');
const router = express.Router();
const bcryptSalt = 10;

router.get('/mybands', ensureLoggedIn(), (req, res, next) => {
  res.render('band/band-page');
})

router.post('/create-band', (req, res, next) => {
  const { content, creatorID, picName } = req.body;
  const picPath = req.file.path;
  const newPost = new Post({ content, creatorID, picPath, picName });

  newBand.save()
    .then(() => {
      res.redirect('/profile');
    })
    .catch(err => console.log(err));
})

router.get('/create-band', (req,res,next) => {
  res.render('band/create-band');
})
module.exports = router;