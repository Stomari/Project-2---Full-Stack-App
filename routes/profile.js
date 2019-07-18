const express = require('express');
const ensureLogin = require('connect-ensure-login');
const multer = require('multer');
const uploadCloud = require('../public/config/cloudinary');
const Picture = require('../models/picture');
const User = require('../models/user');
const Invite = require('../models/invite');
const Band = require('../models/band');
const Request = require('../models/request')

const router = express.Router();

const checkRoles = (role) => {
  return (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === role || req.isAuthenticated() && req.user.role === 'ADMIN') {
      return next();
    } else {
      res.redirect('/news')
    }
  }
}

// CURRENT LOGGED USER PAGE
router.get('/profile', ensureLogin.ensureLoggedIn(), (req, res) => {
  User.findById(req.user._id)
    .populate('bands picture profilePic').populate({ path: 'invites', populate: [{ path: 'owner' }, { path: 'bandInvite' }] })
    .then(data => {
      const user = req.user;
      data.rating = data.votesValues.reduce((total, num) => total + num, 0) / data.votes.length
      res.render('profile/user-page', { data, user })
    })
    .catch(err => console.log(err));
});

// EDIT USER
router.get('/profile/edit', ensureLogin.ensureLoggedIn(), (req, res) => {
  let user = req.user;
  User.findById(req.user._id)
    .then((data) => {
      let datIns = [];
      const inst = ['electric-guitar', 'acoustic-guitar', 'bass', 'keyboard', 'piano', 'drums', 'vocal', 'violin', 'saxophone', 'flute', 'cello', 'clarinet', 'trumpet', 'harp'];
      inst.forEach(element => {
        if (data.instruments.includes(element)) {
          datIns.push('checked')
        } else datIns.push('')
      });
      res.render('profile/profile-edit', { data, datIns, user })
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
    User.updateOne({ _id: req.user.id }, { $set: { email, name, surname, age, biography: about, instruments: userInstruments, profilePic: newPhoto }, $push: { picture: newPhoto } })
      .then(() => {
        res.redirect('/profile');
      })
      .catch((error) => {
        console.log('Error: ', error);
      });
  }

  User.updateOne({ _id: req.user.id }, { $set: { email, name, surname, age, biography: about, instruments: userInstruments } })
    .then(() => {
      res.redirect('/profile');
    })
    .catch((error) => {
      console.log('Error: ', error);
    });

})

// USER PAGE
router.get('/profile/:id', (req, res) => {
  let user = false;
  User.findById(req.params.id)
    .populate('bands picture profilePic')
    .then((data) => {
      if (req.user) user = req.user;
      User.findById(user.id)
        .populate('bands picture')
        .then(userData => {
          data.rating = data.votesValues.reduce((total, num) => total + num, 0) / data.votes.length
          res.render('profile/musician-page', { data, userData, user })
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
})

// INVITES PAGE
router.get('/pendencies', ensureLogin.ensureLoggedIn('login'), (req, res) => {
  User.findById(req.user._id)
    .populate('bands picture profilePic').populate({ path: 'invites', populate: [{ path: 'owner' }, { path: 'bandInvite' }] })
    .then(data => {
      Band.find({ leader: req.user._id })
        .populate({ path: 'request', populate: [{ path: 'owner' }, { path: 'to' }] })
        .then((band) => {
          const user = req.user;
          res.render('profile/invites', { data, user, band });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
})

router.post('/pendencies', ensureLogin.ensureLoggedIn('login'), (req, res) => {
  if (req.body.accept) {
    Band.findOneAndUpdate({ _id: req.body.bandID }, { $push: { members: req.user.id } })
      .then(() => {
        Invite.findByIdAndDelete(req.body.inviteID)
          .then(() => res.redirect('/pendencies'))
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err))
  } else {
    Invite.findByIdAndDelete(req.body.inviteID)
      .then(() => res.redirect('/pendencies'))
      .catch(err => console.log(err));
  }
});

router.post('/pendencies/request', ensureLogin.ensureLoggedIn('login'), (req, res) => {
  if (req.body.accept) {
    Band.findOneAndUpdate({ _id: req.body.bandID }, { $push: { members: req.body.userID } })
      .then(() => {
        Request.findByIdAndDelete(req.body.requestID)
          .then(() => res.redirect('/pendencies'))
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err))
  } else {
    Request.findByIdAndDelete(req.body.requestID)
      .then(() => res.redirect('/pendencies'))
      .catch(err => console.log(err));
  }
})


// Vote

router.post('/vote/:votedUser', ensureLogin.ensureLoggedIn('login'), (req, res) => {
  const { vote, userID } = req.body;
  const votedUser = req.params.votedUser
  User.findById(votedUser)
    .then(user => {
      if (!user.votes.includes(userID.toString())) {
        user.updateOne({ $push: { votes: userID, votesValues: vote } })
          .then(() => res.redirect('/profile/' + votedUser))
          .catch(err => console.log(err))
      } else {
        res.redirect('/profile/' + votedUser)
      }
    })
    .catch(err => console.log(err))
})

// ADMIN PAGE
router.get('/admin', checkRoles('ADMIN'), ensureLogin.ensureLoggedIn('login'), (req, res) => {
  User.find({ _id: { $ne: req.user.id } })
    .then((data) => {
      res.render('admin', { data });
    })
    .catch(err => console.log(err));
})

router.post('/change-role', checkRoles('ADMIN'), ensureLogin.ensureLoggedIn('login'), (req, res) => {
  User.findByIdAndUpdate(req.body.userID, { role: req.body.role })
    .then(() => res.redirect('/admin'))
    .catch(err => console.log(err));
})

router.get('/delete/:userID', checkRoles('ADMIN'), ensureLogin.ensureLoggedIn('login'), (req, res) => {
  User.findByIdAndDelete(req.params.userID)
    .then(() => res.redirect('/admin'))
    .catch(err => console.log(err));
})

module.exports = router;
