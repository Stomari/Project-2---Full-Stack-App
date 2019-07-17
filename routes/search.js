const express = require('express');
const User = require('../models/user');
const Band = require('../models/band');
const router = express.Router();
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');

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

router.post('/search', (req, res) => {
  const { userID } = req.body;
  const { _id } = req.user;
  console.log(_id);

  Band.findOneAndUpdate({ leader: _id }, { $push: { members: userID } })
    .then(band => {
      User.findByIdAndUpdate(userID, { $push: { mybands: band } })
        .then(() => res.redirect('/search'))
        .catch(err => console.log(err))

    })
    .catch(err => console.log(err))
})
module.exports = router;