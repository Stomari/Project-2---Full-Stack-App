const express = require('express');
const ensureLogin = require('connect-ensure-login');
const User = require('../models/user');

const router = express.Router();

router.get('/profile', ensureLogin.ensureLoggedIn(), (req, res) => {
  User.findById(req.user._id)
    .then(data => res.render('profile/user-page', data))
    .catch(err => console.log(err));
});

router.get('/profile/edit', ensureLogin.ensureLoggedIn(), (req, res) => {
  User.findById(req.user._id)
    .then(data => res.render('profile/edit', data))
    .catch(err => console.log(err));
});

// router.post('/profile/edit', (req, res) => {
//   const { title, author, description, rating, latitude, longitude } = req.body;

//   const imageUrl = req.file.url;

//   const location = {
//     type: 'Point',
//     coordinates: [longitude, latitude]
//   };

//   Book.update({ _id: req.params.bookID }, { $set: { title, author, description, rating, location, imageUrl } })
//     .then((book) => {
//       res.redirect('/books/edit/' + req.params.bookID);
//     })
//     .catch((error) => {
//       console.log(error);
//     })
// })

module.exports = router;
