require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');

// Importar conexão do banco de dados (isso inicializa as tabelas)
require('./database/db');

// Importar Rotas
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const clientRoutes = require('./routes/clients');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar o Engine de Views (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares Globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (CSS, Imagens, JS cliente)
app.use(express.static(path.join(__dirname, 'public')));

// Configurar Sessões de Usuário
app.use(session({
  secret: process.env.SESSION_SECRET || 'pazine-barber_barber_default_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // Durabilidade de 1 dia (24 horas)
    secure: false, // Setar como true apenas em produção com HTTPS
    httpOnly: true
  }
}));

// Definição de Rotas
app.use('/', indexRoutes);
app.use('/', authRoutes); // Registra /login, /register, /logout
app.use('/', dashboardRoutes); // Registra /dashboard
app.use('/', clientRoutes); // Registra /clients, /clients/new, /clients/:id/edit, etc.

// Middleware para tratamento de rotas não encontradas (404)
app.use((req, res, next) => {
  res.status(404).render('login', { 
    error: 'Página não encontrada. Faça login para continuar.', 
    success: null 
  });
});

// Middleware Global de Tratamento de Erros
app.use((err, req, res, next) => {
  console.error('Unhandled application error:', err);
  res.status(500).send('Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.');
});

// Iniciar Servidor Express
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  Pazine Barber SaaS está rodando com sucesso!`);
  console.log(`  Local: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
