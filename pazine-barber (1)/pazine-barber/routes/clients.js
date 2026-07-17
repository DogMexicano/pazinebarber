const express = require('express');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const STATUS_OPTIONS = ['Agendado', 'Em Atendimento', 'Finalizado', 'Cancelado'];

// ---------- LISTAR ----------
router.get('/clients', requireAuth, (req, res) => {
  try {
    const userId = req.session.userId;
    const search = (req.query.q || '').trim();

    let clients;
    if (search) {
      clients = db
        .prepare('SELECT * FROM clients WHERE user_id = ? AND name LIKE ? ORDER BY created_at DESC')
        .all(userId, `%${search}%`);
    } else {
      clients = db
        .prepare('SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC')
        .all(userId);
    }

    res.render('clients/list', { clients, search, userName: req.session.userName });
  } catch (err) {
    console.error('Erro ao listar clientes:', err);
    res.status(500).send('Erro ao carregar clientes.');
  }
});

// ---------- NOVO (form) ----------
router.get('/clients/new', requireAuth, (req, res) => {
  res.render('clients/new', {
    error: null,
    statusOptions: STATUS_OPTIONS,
    userName: req.session.userName
  });
});

// ---------- NOVO (submit) ----------
router.post('/clients', requireAuth, (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, email, phone, company, project_name, project_value, status, notes } = req.body;

    if (!name || !project_value || !status) {
      return res.status(400).render('clients/new', {
        error: 'Nome, valor e status são obrigatórios.',
        statusOptions: STATUS_OPTIONS,
        userName: req.session.userName
      });
    }

    db.prepare(`
      INSERT INTO clients (user_id, name, email, phone, company, project_name, project_value, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      name.trim(),
      email ? email.trim() : null,
      phone ? phone.trim() : null,
      company ? company.trim() : null,
      project_name ? project_name.trim() : null,
      parseFloat(project_value),
      status,
      notes ? notes.trim() : null
    );

    res.redirect('/clients');
  } catch (err) {
    console.error('Erro ao criar cliente:', err);
    res.status(500).render('clients/new', {
      error: 'Erro ao salvar o cliente. Tente novamente.',
      statusOptions: STATUS_OPTIONS,
      userName: req.session.userName
    });
  }
});

// ---------- EDITAR (form) ----------
router.get('/clients/:id/edit', requireAuth, (req, res) => {
  try {
    const userId = req.session.userId;
    const client = db
      .prepare('SELECT * FROM clients WHERE id = ? AND user_id = ?')
      .get(req.params.id, userId);

    if (!client) {
      return res.status(404).send('Cliente não encontrado.');
    }

    res.render('clients/edit', {
      client,
      error: null,
      statusOptions: STATUS_OPTIONS,
      userName: req.session.userName
    });
  } catch (err) {
    console.error('Erro ao carregar cliente:', err);
    res.status(500).send('Erro ao carregar cliente.');
  }
});

// ---------- EDITAR (submit) ----------
router.post('/clients/:id', requireAuth, (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, email, phone, company, project_name, project_value, status, notes } = req.body;

    const client = db
      .prepare('SELECT * FROM clients WHERE id = ? AND user_id = ?')
      .get(req.params.id, userId);

    if (!client) {
      return res.status(404).send('Cliente não encontrado.');
    }

    if (!name || !project_value || !status) {
      return res.status(400).render('clients/edit', {
        client: { ...client, ...req.body },
        error: 'Nome, valor e status são obrigatórios.',
        statusOptions: STATUS_OPTIONS,
        userName: req.session.userName
      });
    }

    db.prepare(`
      UPDATE clients
      SET name = ?, email = ?, phone = ?, company = ?, project_name = ?, project_value = ?, status = ?, notes = ?
      WHERE id = ? AND user_id = ?
    `).run(
      name.trim(),
      email ? email.trim() : null,
      phone ? phone.trim() : null,
      company ? company.trim() : null,
      project_name ? project_name.trim() : null,
      parseFloat(project_value),
      status,
      notes ? notes.trim() : null,
      req.params.id,
      userId
    );

    res.redirect('/clients');
  } catch (err) {
    console.error('Erro ao atualizar cliente:', err);
    res.status(500).send('Erro ao atualizar cliente.');
  }
});

// ---------- EXCLUIR ----------
router.post('/clients/:id/delete', requireAuth, (req, res) => {
  try {
    const userId = req.session.userId;
    db.prepare('DELETE FROM clients WHERE id = ? AND user_id = ?').run(req.params.id, userId);
    res.redirect('/clients');
  } catch (err) {
    console.error('Erro ao excluir cliente:', err);
    res.status(500).send('Erro ao excluir cliente.');
  }
});

module.exports = router;
