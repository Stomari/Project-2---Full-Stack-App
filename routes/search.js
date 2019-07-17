const express = require('express');
const User = require('../models/user');
const Invite = require('../models/invite');
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');

const router = express.Router();

// SEARCH ROUTE
router.get('/search', ensureLoggedIn('login'), (req, res) => {
  const user = req.user;
  res.render('search', { user });
});

router.get('/search/users', ensureLoggedIn('login'), (req, res) => {
  const user = req.user;
  res.render('profile/musician-search', { user });
});

router.post('/search/users', (req, res) => {
  User.find({ instruments: req.body.instruments, _id: { $ne: req.user.id } })
    .then(data => {
      res.render('profile/musician-search', { data })
    })
    .catch(err => console.log(err));
})

router.get('/search/bands', ensureLoggedIn('login'), (req, res) => {
  const user = req.user;
  res.render('band/band-search', { user });
});


router.post('/search/bands', (req, res) => {
  Band.find({ genre: req.body.genres })
    .then(data => {
      res.render('band/band-search', { data })
    })
    .catch(err => console.log(err));
})

// USER INVITATION
router.post('/invitation', ensureLoggedIn('login'), (req, res) => {
  const { userID, bands } = req.body;
  const { _id } = req.user;

  const newInvite = new Invite({
    owner: _id,
    to: userID,
    bandInvite: bands,
  })
  newInvite.save();

  User.updateOne({ _id: userID }, { $push: { invites: newInvite } })
    .then((data) => {
      console.log(data)
      res.redirect('/search')
    })
    .catch(err => console.log(err));
})

module.exports = router;