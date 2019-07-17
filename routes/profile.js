const express = require('express');
const ensureLogin = require('connect-ensure-login');
const multer = require('multer');
const User = require('../models/user');
const Picture = require('../models/picture');
const Invite = require('../models/invite');
const Band = require('../models/band');
const uploadCloud = require('../public/config/cloudinary');

const router = express.Router();

// CURRENT LOGGED USER PAGE
router.get('/profile', ensureLogin.ensureLoggedIn(), (req, res) => {
  User.findById(req.user._id)
    .populate('bands picture profilePic').populate({ path: 'invites', populate: [{ path: 'owner' }, { path: 'bandInvite' }] })
    .then(data => {
      const user = req.user;
      res.render('profile/user-page', { data, user })
    })
    .catch(err => console.log(err));
});

// EDIT USER
router.get('/profile/edit', ensureLogin.ensureLoggedIn(), (req, res) => {
  let user = req.user;
  User.findById(req.user._id)
    .then((data) => {
      let datIns = [];
      const inst = ['electric-guitar', 'acoustic-guitar', 'bass', 'keyboard', 'piano', 'drums', 'vocal', 'violin', 'saxophone', 'flute', 'cello', 'clarinet', 'trumpet', 'harp'];
      inst.forEach(element => {
        if (data.instruments.includes(element)) {
          datIns.push('checked')
        } else datIns.push('')
      });
      res.render('profile/profile-edit', { data, datIns, user })
    })
    .catch(err => console.log(err));
});

router.post('/profile/edit', uploadCloud.single('photo'), (req, res) => {
  const { email, name, surname, age, about } = req.body;
  const instruments = ['electric-guitar', 'acoustic-guitar', 'bass', 'keyboard', 'piano', 'drums', 'vocal', 'violin', 'saxophone', 'flute', 'cello', 'clarinet', 'trumpet', 'harp'];
  const userInstruments = [];
  instruments.forEach((el, i) => {
    if (req.body[el]) {
      userInstruments.push(instruments[i]);
    }
  });
  let imgPath = '';
  let newPhoto = '';
  if (req.file !== undefined) {
    imgPath = req.file.url;
    newPhoto = new Picture({ path: imgPath });
    newPhoto.save();
    User.updateOne({ _id: req.user.id }, { $set: { email, name, surname, age, biography: about, instruments: userInstruments, profilePic: newPhoto }, $push: { picture: newPhoto } })
      .then(() => {
        res.redirect('/profile');
      })
      .catch((error) => {
        console.log('Error: ', error);
      });
  }

  User.updateOne({ _id: req.user.id }, { $set: { email, name, surname, age, biography: about, instruments: userInstruments } })
    .then(() => {
      res.redirect('/profile');
    })
    .catch((error) => {
      console.log('Error: ', error);
    });

})

// USER PAGE
router.get('/profile/:id', (req, res) => {
  let user = false;
  User.findById(req.params.id)
    .populate('bands picture profilePic')
    .then((data) => {
      if (req.user) user = req.user;
      User.findById(user.id)
        .populate('bands picture')
        .then(userData => {
          data.rating = data.votesValues.reduce((total, num) => total + num) / data.votes.length
          console.log(data.rating);
          res.render('profile/musician-page', { data, userData, user })
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
})

// INVITES PAGE
router.get('/invites', ensureLogin.ensureLoggedIn('login'), (req, res) => {
  User.findById(req.user._id)
    .populate('bands picture profilePic').populate({ path: 'invites', populate: [{ path: 'owner' }, { path: 'bandInvite' }] })
    .then(data => {
      const user = req.user;
      res.render('profile/invites', { data, user });
    })
    .catch(err => console.log(err));
})

router.post('/invites', ensureLogin.ensureLoggedIn('login'), (req, res) => {
  if (req.body.accept) {
    Band.findOneAndUpdate({ _id: req.body.bandID }, { $push: { members: req.user.id } })
      .then(() => {
        Invite.findByIdAndDelete(req.body.inviteID)
          .then(() => res.redirect('/invites'))
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err))
  } else {
    Invite.findByIdAndDelete(req.body.inviteID)
      .then(() => res.redirect('/invites'))
      .catch(err => console.log(err));
  }
})
// Vote

router.post('/vote/:votedUser', ensureLogin.ensureLoggedIn('login'), (req, res) => {
  const { vote, userID } = req.body;
  const votedUser = req.params.votedUser
  User.findById(votedUser)
    .then(user => {
      if (!user.votes.includes(userID.toString())) {
        user.updateOne({ $push: { votes: userID, votesValues: vote } })
          .then(() => res.redirect('/profile/' + votedUser))
          .catch(err => console.log(err))
      } else {
        res.redirect('/profile/' + votedUser)
      }
    })
    .catch(err => console.log(err))
})

module.exports = router;
