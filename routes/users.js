const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registerdUser = await User.register(user, password);
    req.login(registerdUser, err => {
      if(err) return next(err);
      req.flash('success', 'Welcome to YelpCamp');
      res.redirect('/campgrounds');
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/register');
  }
}));

router.get('/login', (req, res) => {
  res.render('users/login');
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
  req.flash('success', 'Welcome Back!');
  const redirect = req.session.requestTo || '/campgrounds';
  delete req.session.requestTo;
  res.redirect(redirect);
});

router.get('/logout', (req, res) => {
  req.logOut();
  req.flash('success', 'Logout successful');
  res.redirect('/campgrounds');
});

module.exports = router;