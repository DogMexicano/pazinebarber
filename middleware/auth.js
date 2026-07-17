/**
 * Authentication Middleware for Pazine Barber
 */

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    // Expose user info to EJS templates
    res.locals.user = {
      id: req.session.userId,
      name: req.session.userName,
      email: req.session.userEmail
    };
    return next();
  }
  
  // If not logged in, redirect to login page
  res.redirect('/login');
}

function redirectIfAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
}

module.exports = {
  requireAuth,
  redirectIfAuthenticated
};
