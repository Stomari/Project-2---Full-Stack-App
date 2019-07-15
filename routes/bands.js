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
  const userID = req.user._id
  console.log('USERID', userID)
  User.find(userID)
    .then(() => {
      Band.find({ leader: userID })
        .then(bands => {
          res.render('band/band-page', { bands });
        })
        .catch(err => console.log(err))

    })
    .catch(err => console.log(err))

})

router.get('/band-profile', ensureLoggedIn(), (req, res, next) => {
  res.render('band/band-profile');
})


router.post('/create-band', (req, res, next) => {
  const { bandname, genre, biography } = req.body;
  const leader = req.user;
  const newBand = new Band({ bandname, leader, genre, biography });
  const userID = req.user._id;
  console.log('MY USER: ', userID);
  console.log('PARAMS: ', req.params.id);


  newBand.save()
    .then(() => {
      User.findByIdAndUpdate(userID, { $push: { bands: newBand } })
        .then()
        .catch(err => console.log(err))

      res.redirect('/band-profile');
    })
    .catch(err => console.log(err));

}
)

router.get('/create-band', (req, res, next) => {
  res.render('band/create-band')
})
module.exports = router;