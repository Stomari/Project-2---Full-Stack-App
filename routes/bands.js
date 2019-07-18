const express = require('express');
const passport = require('passport');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');
const User = require('../models/user');
const Band = require('../models/band');
const router = express.Router();
const bcryptSalt = 10;
const Request = require('../models/request')
const multer = require('multer');
const uploadCloud = require('../public/config/cloudinary');
const Picture = require('../models/picture');

// User band pages
router.get('/mybands', ensureLoggedIn(), (req, res, next) => {
  const user = req.user._id
  User.find(user)
    .then(() => {
      Band.find({ members: user })
        .populate('members')
        .then(bands => {
          bands.forEach(band => {
            band.isLeader = false;
            if (band.leader.toString() === user.toString()) band.isLeader = true;
          });
          res.render('band/band-page', { bands, user });
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

// Delete band
router.post('/delete-band/:bandID', ensureLoggedIn(), (req, res, next) => {
  const { bandID } = req.params
  Band.findByIdAndDelete(bandID)
    .then(() => res.redirect('/mybands'))
    .catch(err => console.log(err))
})

// Create a band
router.get('/create-band', ensureLoggedIn('login'), (req, res, next) => {
  let user = req.user._id
  User.find(req.user._id)
    .then((user) => res.render('band/band-create', { user }))
    .catch(err => console.log(err))

})
router.post('/create-band', ensureLoggedIn('login'), uploadCloud.single('bandlogo'), (req, res, next) => {
  const { bandname, biography } = req.body;
  const genres = ['rock', 'country', 'pop', 'jazz', 'hip-hop', 'folk', 'electronic', 'blues', 'instrumental', 'gospel'];
  const userGenres = []
  genres.forEach((el, i) => {
    if (req.body[el]) {
      userGenres.push(genres[i]);
    }
  });
  const leader = req.user;
  const members = []
  members.push(leader);
  let imgPath = '';
  let newPhoto = '';
  if (req.file !== undefined) {
    imgPath = req.file.url;
    newPhoto = new Picture({ path: imgPath });
    newPhoto.save();
    const newBand = new Band({ bandname, leader, genre: userGenres, biography, members, picture: newPhoto });
    const userID = req.user._id;
    newBand.save()
      .then(() => {
        User.findByIdAndUpdate(userID, { $push: { bands: newBand } })
          .then(() => {
            res.redirect('/band-profile/' + newBand._id);
          })
          .catch(err => console.log(err))
      })
      .catch(err => console.log(err));
  } else {
    const newBand = new Band({ bandname, leader, genre: userGenres, biography, members });
    const userID = req.user._id;
    newBand.save()
      .then(() => {
        User.findByIdAndUpdate(userID, { $push: { bands: newBand } })
          .then(() => {
            res.redirect('/band-profile/' + newBand._id);
          })
          .catch(err => console.log(err))
      })
      .catch(err => console.log(err));
  }
})

// Edit a band
router.get('/band-edit/:bandID', ensureLoggedIn('login'), (req, res, next) => {
  const bandID = req.params.bandID;
  const genres = ['rock', 'country', 'pop', 'jazz', 'hip-hop', 'folk', 'electronic', 'blues', 'instrumental', 'gospel'];
  let user;
  if (req.user) user = req.user._id;
  Band.findById(bandID)
    .then((band) => {
      User.find({ _id: { $in: band.members, $ne: band.leader } })
        .then(users => {
          let x = true;
          let datIns = []
          users.forEach(user => user.bandDelete = bandID)
          genres.forEach(element => band.genre.includes(element) ? datIns.push('checked') : datIns.push(''))
          if (band.members.includes(user)) res.render('band/band-edit', { user, users, band, datIns })
          else res.redirect('/mybands')
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

router.post('/band-edit/:bandID', ensureLoggedIn(), uploadCloud.single('bandlogo'), (req, res, next) => {
  const bandID = req.params.bandID;
  const { bandname } = req.body
  const genres = ['rock', 'country', 'pop', 'jazz', 'hip-hop', 'folk', 'electronic', 'blues', 'instrumental', 'gospel'];
  let user;
  const newGenres = []
  genres.forEach((el, i) => req.body[el] ? newGenres.push(genres[i]) : false)
  if (req.user) user = req.user._id;

  let imgPath = '';
  let newPhoto = '';
  if (req.file !== undefined) {
    imgPath = req.file.url;
    newPhoto = new Picture({ path: imgPath });
    newPhoto.save();
    Band.findByIdAndUpdate(bandID, { $set: { bandname, genre: newGenres, picture: newPhoto } })
      .then(() => res.redirect('/mybands'))
      .catch(err => console.log(err))
  } else {
    Band.findByIdAndUpdate(bandID, { $set: { bandname, genre: newGenres } })
      .then(() => res.redirect('/mybands'))
      .catch(err => console.log(err))
  }
})

// delete members from band
router.post('/delete-member/:userID', ensureLoggedIn(), (req, res, next) => {
  const userID = req.params.userID;
  const { bandID } = req.body;

  Band.findByIdAndUpdate(bandID, { $pull: { members: userID } })
    .then(() => res.redirect('/band-edit/' + bandID))
    .catch(err => console.log(err))

})

// See band profile
router.get('/band-profile/:bandID', (req, res, next) => {
  const bandID = req.params.bandID;
  let user;
  if (req.user) {
    user = req.user._id
    user.joined = true;
  }
  Band.findById(bandID)
    .populate('picture members')
    .then((band) => {
      User.find({ _id: { $in: band.members } })
        .then(users => {
          let x = true;
          // Check if user is a member so he can post in the band chat and see the chat
          if (!band.members.includes(user)) { x = false }
          // Check if user isnt already in the band
          if (band.members.includes(user)) { user.joined = false }
          res.render('band/band-profile', { band, user, users, x })
        })
        .catch(err => console.log(err))

    })
    .catch(err => console.log(err))
})

router.post('/band-profile/:bandID', ensureLoggedIn('login'), (req, res, next) => {
  const bandID = req.params.bandID;
  const { chatband } = req.body;
  Band.findByIdAndUpdate(bandID, { $push: { chatband } })
    .then(() => {
      res.redirect('/band-profile/' + bandID)
    })
    .catch()
})
router.post('/request-to-join/:bandID', ensureLoggedIn('login'), (req, res, next) => {
  const bandID = req.params.bandID;
  const user = req.user._id;

  const newRequest = new Request({
    owner: user,
    to: bandID,
  })
  newRequest.save();

  Band.findByIdAndUpdate(bandID, { $push: { request: newRequest } })
    .then(() => {
      res.redirect('/band-profile/' + bandID)
    })
    .catch(err => console.log(err))
})
module.exports = router;