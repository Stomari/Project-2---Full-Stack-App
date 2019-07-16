const express = require('express');
const ensureLogin = require('connect-ensure-login');
const multer = require('multer');
const User = require('../models/user');
const Picture = require('../models/picture');
const uploadCloud = require('../public/config/cloudinary');

const router = express.Router();

router.get('/profile', ensureLogin.ensureLoggedIn(), (req, res) => {
  User.findById(req.user._id)
    .populate('bands picture')
    .then(data => {
      res.render('profile/user-page', data)
    })
    .catch(err => console.log(err));
});

router.get('/profile/edit', ensureLogin.ensureLoggedIn(), (req, res) => {
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
  if (req.file !== undefined) {
    imgPath = req.file.url;
  }
  const newPhoto = new Picture({ path: imgPath });
  newPhoto.save();


  User.update({ _id: req.user.id }, { $set: { email, name, surname, age, biography: about, instruments: userInstruments, profilePic: newPhoto }, $push: { picture: newPhoto } })
    .then(() => {
      res.redirect('/profile');
    })
    .catch((error) => {
      console.log('Error: ', error);
    });
})

module.exports = router;
