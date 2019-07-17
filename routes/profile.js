const express = require('express');
const ensureLogin = require('connect-ensure-login');
const multer = require('multer');
const User = require('../models/user');
const Picture = require('../models/picture');
const Invite = require('../models/invite')
const uploadCloud = require('../public/config/cloudinary');

const router = express.Router();

// CURRENT LOGGED USER PAGE
router.get('/profile', ensureLogin.ensureLoggedIn(), (req, res) => {
  User.findById(req.user._id)
    .populate('bands picture profilePic').populate({path: 'invites', populate: [{path: 'owner'} , {path: 'bandInvite'}]})
    .then(data => {
      console.log(data.invites[0]);
      const user = req.user;
      res.render('profile/user-page', { data, user })
    })
    .catch(err => console.log(err));
});

// EDIT USER
router.get('/profile/edit', ensureLogin.ensureLoggedIn(), (req, res) => {
  console.log(req.user)
  User.findById(req.user._id)
    .then((data) => {
      let datIns = [];
      const inst = ['electric-guitar', 'acoustic-guitar', 'bass', 'keyboard', 'piano', 'drums', 'vocal', 'violin', 'saxophone', 'flute', 'cello', 'clarinet', 'trumpet', 'harp'];
      inst.forEach(element => {
        if (data.instruments.includes(element)) {
          datIns.push('checked')
        } else datIns.push('')
      });
      res.render('profile/profile-edit', { data, datIns })
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
    User.update({ _id: req.user.id }, { $set: { email, name, surname, age, biography: about, instruments: userInstruments, profilePic: newPhoto }, $push: { picture: newPhoto } })
      .then(() => {
        res.redirect('/profile');
      })
      .catch((error) => {
        console.log('Error: ', error);
      });
  }

  User.update({ _id: req.user.id }, { $set: { email, name, surname, age, biography: about, instruments: userInstruments } })
    .then(() => {
      res.redirect('/profile');
    })
    .catch((error) => {
      console.log('Error: ', error);
    });

})

// USER PAGE
router.get('/profile/:id', (req, res) => {
  User.findById(req.params.id)
    .populate('bands picture profilePic')
    .then((data) => {
      const user = req.user;
      User.findById(user.id)
        .populate('bands picture')
        .then(userData => {
          console.log(userData)
          res.render('profile/musician-page', { data, userData })
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
})


module.exports = router;
