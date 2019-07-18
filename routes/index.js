const express = require('express');
const router = express.Router();
const User = require('../models/user')

router.get('/', (req, res) => {
  let user;
  if (req.user) user = req.user._id;
  User.find()
    .then(users => {
      // Make users receive their vote value
      users.map(rankedUser => {
        rankedUser.vote = rankedUser.votesValues.reduce((total, num) => total + num, 0) / rankedUser.votes.length
      })
      // Sort them Desc
      users.sort((a, b) => b.vote - a.vote)
      // Remove remainder
      while (users.length > 3) {
        users.pop();
      }
      res.render('index', { user, users })
    })
    .catch(err => console.log(err))
});

module.exports = router;
