const express = require('express');
const ensureLogin = require('connect-ensure-login');
const multer = require('multer');
const User = require('../models/user');
const Picture = require('../models/picture');
const News = require('../models/news');
const uploadCloud = require('../public/config/cloudinary');

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

// ALL NEWS PAGE
router.get('/news', ensureLogin.ensureLoggedIn(), (req, res) => {
  News.find()
    .populate('writer image')
    .then((data) => {
      const user = req.user;
      if (req.user.role === 'EDITOR' || req.user.role === 'ADMIN') {
        req.user.editor = true;
      }
      res.render('news/news', { data, user })
    })
    .catch(err => console.log(err));
});

// USER ARTICLES
router.get('/news/your-articles', checkRoles('EDITOR'), ensureLogin.ensureLoggedIn(), (req, res) => {
  const userID = req.user.id;
  const user = req.user;
  News.find({ writer: userID })
    .then((data) => {
      res.render('news/user-articles', { data, user })
    })
    .catch(err => console.log(err));
});

// EDIT ARTICLE
router.get('/news/:newsID/edit', checkRoles('EDITOR'), ensureLogin.ensureLoggedIn(), (req, res) => {
  News.findById(req.params.newsID)
    .then((data) => {
      res.render('news/news-edit', data);
    })
    .catch(err => console.log(err));
})

router.post('/news/:newsID/edit', checkRoles('EDITOR'), uploadCloud.single('photo'), ensureLogin.ensureLoggedIn(), (req, res) => {
  const { title, abstract, text } = req.body;

  let imgPath = '';
  let newPhoto = '';
  if (req.file !== undefined) {
    imgPath = req.file.url;
    newPhoto = new Picture({ path: imgPath });
    newPhoto.save();
    News.updateOne({ _id: req.params.newsID }, { $set: { title, abstract, text, image: newPhoto } })
      .then(() => {
        res.redirect('/news/your-articles');
      })
      .catch((error) => {
        console.log('Error: ', error);
      });
  }

  News.updateOne({ _id: req.params.newsID }, { $set: { title, abstract, text } })
    .then(() => {
      res.redirect('/news/your-articles');
    })
    .catch((error) => {
      console.log('Error: ', error);
    });
})

// CREATE NEWS
router.get('/news/create', checkRoles('EDITOR'), ensureLogin.ensureLoggedIn(), (req, res) => {
  const user = req.user;
  res.render('news/news-create', { user })
});

router.post('/news/create', uploadCloud.single('photo'), (req, res) => {
  const { title, abstract, text, writerID } = req.body;
  let imgPath = '';
  let newPhoto = '';
  if (req.file !== undefined) {
    imgPath = req.file.url;
    newPhoto = new Picture({ path: imgPath });
    newPhoto.save();

    newArticle = new News({
      title,
      abstract,
      text,
      writer: writerID,
      image: newPhoto,
    });
    newArticle.save();
  }

  newArticle = new News({
    title,
    abstract,
    text,
    writer: writerID,
  });
  newArticle.save();

  res.redirect('/news')
});

// ARTICLE PAGE
router.get('/news/:newsID', ensureLogin.ensureLoggedIn(), (req, res) => {
  const { newsID } = req.params;
  const user = req.user;
  News.findById(newsID)
    .populate('writer image')
    .then((data) => {
      console.log(data)
      res.render('news/news-page', { data, user });
    })
    .catch(err => console.log(err));
});

// DELETE ARTICLE
router.get('/news/:newsID/delete', (req, res) => {
  News.findByIdAndDelete(req.params.newsID)
    .then(() => {
      res.redirect('/news/your-articles');
    })
    .catch(err => console.log(err));
})

module.exports = router;
