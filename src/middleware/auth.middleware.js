export function isLoggedIn(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  req.flash('error', 'You must be logged in first.');
  return res.redirect('/api/auth/login');
}
