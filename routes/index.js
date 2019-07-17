const express = require('express');
const router = express.Router();
const User = require('../models/user')
router.get('/', (req, res) => {
  if (req.user !== undefined) {
    User.find(req.user._id)
      .then(user => res.render('index', { user }))
      .catch(err => console.log(err))
  } else {
    res.render('index');
  }
});

module.exports = router;
