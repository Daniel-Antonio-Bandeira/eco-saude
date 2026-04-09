const express = require('express');
const cors    = require('cors');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const pool    = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'eco-saude-secret-2024';

// Serve arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Garante que a pasta uploads existe
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase())
            && allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Apenas imagens são permitidas'));
  }
});

// ── Middleware de autenticação ────────────────────────────────────────────────
function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Token inválido ou expirado' });
  }
}

function apenasAdmin(req, res, next) {
  if (req.usuario.perfil !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }
  next();
}

// ── POST /auth/login ─────────────────────────────────────────────────────────
app.post('/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) return res.status(400).json({ error: 'Email e senha obrigatórios' });

    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const usuario = result.rows[0];

    if (!usuario) return res.status(401).json({ error: 'Email ou senha incorretos' });

    const senhaOk = await bcrypt.compare(senha, usuario.senha);
    if (!senhaOk) return res.status(401).json({ error: 'Email ou senha incorretos' });

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no login' });
  }
});

// ── POST /auth/registro ──────────────────────────────────────────────────────
app.post('/auth/registro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    if (senha.length < 6) return res.status(400).json({ error: 'Senha deve ter ao menos 6 caracteres' });

    const hash = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, perfil) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, perfil',
      [nome, email, hash, 'cidadao']
    );

    res.status(201).json({ message: 'Conta criada com sucesso!', usuario: result.rows[0] });

  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Este email já está cadastrado' });
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

// ── GET /auth/me ─────────────────────────────────────────────────────────────
app.get('/auth/me', autenticar, (req, res) => {
  res.json({ usuario: req.usuario });
});

// ── POST /denuncias (qualquer usuário logado) ────────────────────────────────
app.post('/denuncias', upload.single('foto'), async (req, res) => {
  try {
    const { tipo, descricao, latitude, longitude, endereco } = req.body;
    const foto = req.file ? req.file.filename : null;

    const result = await pool.query(
      `INSERT INTO denuncias (tipo, descricao, foto, latitude, longitude, endereco)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [tipo, descricao, foto, latitude || null, longitude || null, endereco || null]
    );

    res.status(201).json({ message: 'Denúncia criada com sucesso!', denuncia: result.rows[0] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao salvar denúncia' });
  }
});

// ── GET /denuncias ───────────────────────────────────────────────────────────
app.get('/denuncias', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, tipo, descricao, foto, latitude, longitude, endereco, data_criacao, status
       FROM denuncias ORDER BY data_criacao DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar denúncias' });
  }
});

// ── PATCH /denuncias/:id/status (somente admin) ──────────────────────────────
app.patch('/denuncias/:id/status', autenticar, apenasAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusValidos = ['Pendente', 'Em análise', 'Resolvida'];
    if (!statusValidos.includes(status)) return res.status(400).json({ error: 'Status inválido' });

    const result = await pool.query(
      'UPDATE denuncias SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Denúncia não encontrada' });

    res.json({ message: 'Status atualizado!', denuncia: result.rows[0] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// ── DELETE /denuncias/:id (somente admin) ────────────────────────────────────
app.delete('/denuncias/:id', autenticar, apenasAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const find = await pool.query('SELECT foto FROM denuncias WHERE id = $1', [id]);
    if (find.rows.length === 0) return res.status(404).json({ error: 'Denúncia não encontrada' });

    const foto = find.rows[0].foto;
    if (foto) {
      const caminhoFoto = path.join(uploadDir, foto);
      if (fs.existsSync(caminhoFoto)) fs.unlinkSync(caminhoFoto);
    }

    await pool.query('DELETE FROM denuncias WHERE id = $1', [id]);

    res.json({ message: 'Denúncia excluída com sucesso!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir denúncia' });
  }
});

// ── Inicia servidor ──────────────────────────────────────────────────────────
app.listen(3000, () => {
  console.log('🌱 Eco Saúde rodando em http://localhost:3000');
});
