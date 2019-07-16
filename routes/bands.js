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
  User.find(userID)
    .then(() => {
      Band.find({ members: userID })
        .then(bands => {
          console.log(bands)
          res.render('band/band-page', { bands });
        })
        .catch(err => console.log(err))

    })
    .catch(err => console.log(err))

})

router.post('/create-band', (req, res, next) => {
  const { bandname, genre, biography } = req.body;
  const leader = req.user;
  const members = []
  members.push(leader);
  console.log(members)
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
router.get('/create-band', (req, res, next) => {
  res.render('band/create-band')
})

router.get('/band-profile/:bandID', (req, res, next) => {
  const bandID = req.params.bandID;

  Band.findById(bandID)
    .then((band) => {
      User.findById(band.leader)
        .then((user) => {
          res.render('band/band-profile', { band, user })
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