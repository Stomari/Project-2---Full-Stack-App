const express = require('express');
const ensureLogin = require('connect-ensure-login');
const User = require('../models/user');
const check = require('../public/javascript/script')

const router = express.Router();

router.get('/profile', ensureLogin.ensureLoggedIn(), (req, res) => {
  User.findById(req.user._id)
    .then(data => res.render('profile/user-page', data))
    .catch(err => console.log(err));
});

router.get('/profile/edit', ensureLogin.ensureLoggedIn(), (req, res) => {
  User.findById(req.user._id)
    .then((data) => {
      let datIns = [];
      const inst = ['electric-guitar', 'acoustic-guitar', 'bass', 'keyboard', 'piano', 'drums', 'vocal', 'violin', 'saxophone', 'flute', 'cello', 'clarinet', 'trumpet', 'harp'];
      // data.ins = ['checked','', 'checked']
      console.log(data.instruments)
      inst.forEach(element => {
        if(data.instruments.includes(element)){
          datIns.push('checked')
        } else datIns.push('')
      });
      console.log(datIns);
      res.render('profile/profile-edit', {data, datIns})
    })
    .catch(err => console.log(err));
});

router.post('/profile/edit', (req, res) => {
  const { username, email, picture, name, surname, age, about } = req.body;
  const instruments = ['electric-guitar', 'acoustic-guitar', 'bass', 'keyboard', 'piano', 'drums', 'vocal', 'violin', 'saxophone', 'flute', 'cello', 'clarinet', 'trumpet', 'harp'];
  const userInstruments = [];
  instruments.forEach((el, i) => {
    if (req.body[el]) {
      userInstruments.push(instruments[i]);
    }
  });

  console.log(userInstruments)

  User.update({ _id: req.user.id }, { $set: { username, email, picture, name, surname, age, biography: about, instruments: userInstruments } })
    .then(() => {
      res.redirect('/profile');
    })
    .catch((error) => {
      console.log(error);
    });
})

module.exports = router;
