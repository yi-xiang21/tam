const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const router = express.Router();

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'shop_len',
  port: 3306,
});

router.post('/register', async (req, res) => {
  const {name, username, password, phone, email } = req.body; 
  const role = 'customer'; 
  if (!name || !username || !password || !email || !phone) {
    return res.json({ status: 'error', message: 'Thiếu thông tin đăng ký' });
  }
  try {
    const [rows] = await pool.query('SELECT 1 FROM account WHERE username = ? OR email = ? LIMIT 1', [username, email]);
    if (rows.length > 0) {
      return res.json({ status: 'error', message: 'Username hoặc email đã tồn tại' });
    }
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO account (username, password, email, role) VALUES (?, ?, ?, ?)', [username, hash, email, role]);
    await pool.query('INSERT INTO customer (name, phone, address) VALUES (?, ?, ?)', [name, phone, address]);
    return res.json({ status: 'success', message: 'Đăng ký thành công' });
  } catch (err) {
    console.error('Register error:', err);
    return res.json({ status: 'error', message: 'Lỗi server', error: err.sqlMessage || err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ status: 'error', message: 'Sai tài khoản hoặc mật khẩu' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM account WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.json({ status: 'error', message: 'Sai tài khoản hoặc mật khẩu' });
    }
    const account = rows[0];
    const match = await bcrypt.compare(password, account.password);
    if (!match) {
      return res.json({ status: 'error', message: 'Sai tài khoản hoặc mật khẩu' });
    }
    const { account_id, role, email, created_at, updated_at } = account;
    return res.json({ account_id, role, email, created_at, updated_at, status: 'success' });
  } catch (err) {
    console.error('Login error:', err);
    return res.json({ status: 'error', message: 'Lỗi server', error: err.sqlMessage || err.message });
  }
});

module.exports = router;
