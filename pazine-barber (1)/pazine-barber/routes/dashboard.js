const express = require('express');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', requireAuth, (req, res) => {
  try {
    const userId = req.session.userId;

    const totalClients = db
      .prepare('SELECT COUNT(*) AS count FROM clients WHERE user_id = ?')
      .get(userId).count;

    const faturamentoTotal = db
      .prepare("SELECT COALESCE(SUM(project_value), 0) AS total FROM clients WHERE user_id = ? AND status = 'Finalizado'")
      .get(userId).total;

    const receitaPrevista = db
      .prepare("SELECT COALESCE(SUM(project_value), 0) AS total FROM clients WHERE user_id = ? AND status != 'Finalizado'")
      .get(userId).total;

    const statusBreakdown = db
      .prepare('SELECT status, COUNT(*) AS count, COALESCE(SUM(project_value), 0) AS total FROM clients WHERE user_id = ? GROUP BY status')
      .all(userId);

    const recentClients = db
      .prepare('SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC LIMIT 5')
      .all(userId);

    res.render('dashboard', {
      userName: req.session.userName,
      totalClients,
      faturamentoTotal,
      receitaPrevista,
      statusBreakdown,
      recentClients
    });
  } catch (err) {
    console.error('Erro ao carregar dashboard:', err);
    res.status(500).send('Erro ao carregar o painel. Tente novamente mais tarde.');
  }
});

module.exports = router;
