// Garante que apenas usuários logados acessem rotas protegidas
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.redirect('/login');
}

// Impede que usuários já logados acessem login/registro novamente
function redirectIfAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  return next();
}

module.exports = { requireAuth, redirectIfAuthenticated };
