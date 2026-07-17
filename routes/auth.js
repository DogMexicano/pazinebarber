const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database/db');
const { redirectIfAuthenticated } = require('../middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 10;

// ---------- REGISTRO ----------
router.get('/register', redirectIfAuthenticated, (req, res) => {
  res.render('register', { error: null, success: null });
});

router.post('/register', redirectIfAuthenticated, async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).render('register', {
        error: 'Preencha todos os campos para continuar.',
        success: null
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).render('register', {
        error: 'As senhas informadas não coincidem.',
        success: null
      });
    }

    if (password.length < 6) {
      return res.status(400).render('register', {
        error: 'A senha deve ter no mínimo 6 caracteres.',
        success: null
      });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).render('register', {
        error: 'Este e-mail já está cadastrado no sistema.',
        success: null
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(
      name.trim(),
      email.toLowerCase().trim(),
      hashedPassword
    );

    return res.render('login', {
      error: null,
      success: 'Cadastro realizado com sucesso! Faça login para continuar.'
    });
  } catch (err) {
    console.error('Erro no registro:', err);
    return res.status(500).render('register', {
      error: 'Ocorreu um erro ao processar seu cadastro. Tente novamente.',
      success: null
    });
  }
});

// ---------- LOGIN ----------
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('login', { error: null, success: null });
});

router.post('/login', redirectIfAuthenticated, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render('login', {
        error: 'Informe seu e-mail e senha.',
        success: null
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());

    if (!user) {
      return res.status(401).render('login', {
        error: 'E-mail ou senha inválidos.',
        success: null
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).render('login', {
        error: 'E-mail ou senha inválidos.',
        success: null
      });
    }

    req.session.userId = user.id;
    req.session.userName = user.name;

    return res.redirect('/dashboard');
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).render('login', {
      error: 'Ocorreu um erro ao processar seu login. Tente novamente.',
      success: null
    });
  }
});

// ---------- LOGOUT ----------
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao encerrar sessão:', err);
    }
    res.redirect('/login');
  });
});

module.exports = router;
