const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('index', { title: 'Pazine Barber - CRM para Barbeiros' });
});

module.exports = router;
