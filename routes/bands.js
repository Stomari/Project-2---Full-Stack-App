const express = require('express');
const passport = require('passport');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');
const User = require('../models/user');
const Band = require('../models/band');
const router = express.Router();
const bcryptSalt = 10;

// User band pages
router.get('/mybands', ensureLoggedIn(), (req, res, next) => {
  const user = req.user._id
  User.find(user)
    .then(() => {
      Band.find({ members: user })
        .then(bands => {
          res.render('band/band-page', { bands, user });
        })
        .catch(err => console.log(err))

    })
    .catch(err => console.log(err))

})
// Create a band
router.get('/create-band', ensureLoggedIn('login'), (req, res, next) => {
  User.find(req.user._id)
    .then(() => res.render('band/create-band'))
    .catch(err => console.log(err))

})
router.post('/create-band', ensureLoggedIn('login'), (req, res, next) => {
  const { bandname, genre, biography } = req.body;
  const leader = req.user;
  const members = []
  members.push(leader);
  const newBand = new Band({ bandname, leader, genre, biography, members });
  const userID = req.user._id;
  newBand.save()
    .then(() => {
      User.findByIdAndUpdate(userID, { $push: { bands: newBand } })
        .then()
        .catch(err => console.log(err))

      res.redirect('/band-profile/' + newBand._id);
    })
    .catch(err => console.log(err));

}
)

// See band profile
router.get('/band-profile/:bandID', (req, res, next) => {
  const bandID = req.params.bandID;
  let user;
  if (req.user) user = req.user._id;
  Band.findById(bandID)
    .then((band) => {
      User.find({ _id: { $in: band.members } })
        .then(users => {
          let x = true;
          // console.log(users)
          // console.log(band);
          // Check if user is a member so he can post in the band chat
          if (!band.members.includes(user)) { x = false }
          res.render('band/band-profile', { band, user, users, x })
        })
        .catch(err => console.log(err))

    })
    .catch(err => console.log(err))
})

router.post('/band-profile/:bandID', (req, res, next) => {
  const bandID = req.params.bandID;
  const { chatband } = req.body;
  Band.findByIdAndUpdate(bandID, { $push: { chatband } })
    .then(() => {
      res.redirect('/band-profile/' + bandID)
    })
    .catch()
})
module.exports = router;