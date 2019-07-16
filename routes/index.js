const express = require('express');
const User = require('../models/user');

const router = express.Router();

router.get('/', (req, res) => {
  User.find()
    .then((data) => {
      User.findById(req.user.id)
        .populate('bands')
        .then(user => {
          res.render('index', { data, user });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

module.exports = router;
