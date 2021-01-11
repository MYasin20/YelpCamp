const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
  res.render('users/register');
}

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registerdUser = await User.register(user, password);
    req.login(registerdUser, err => {
      if (err) return next(err);
      req.flash('success', 'Welcome to YelpCamp');
      res.redirect('/campgrounds');
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/register');
  }
}

module.exports.renderlogin = (req, res) => {
  res.render('users/login');
}

module.exports.login = (req, res) => {
  req.flash('success', 'Welcome Back!');
  const redirect = req.session.requestTo || '/campgrounds';
  delete req.session.requestTo;
  res.redirect(redirect);
}

module.exports.logout = (req, res) => {
  req.logOut();
  req.flash('success', 'Logout successful');
  res.redirect('/campgrounds');
}