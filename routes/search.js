const express = require('express');
const User = require('../models/user');
const Invite = require('../models/invite');
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');

const router = express.Router();

router.get('/search', ensureLoggedIn('login'), (req, res) => {
  User.find({ _id: { $ne: req.user.id } })
    .then((data) => {
      User.findById(req.user.id)
        .populate('bands')
        .then(user => {
          res.render('band/band-search', { data, user });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

router.post('/invite', ensureLoggedIn('login'), (req, res) => {
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