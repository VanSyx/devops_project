const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || 'App';

// Kết nối database
let db;
async function connectDB() {
  db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  console.log('Connected to MySQL');

  // Tạo bảng nếu chưa có
  await db.execute(`
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// ✅ /health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ✅ /about - thông tin sinh viên
app.get('/about', (req, res) => {
  res.json({
    ho_ten: 'Trần Văn Sỹ',        
    ma_so_sinh_vien: '2251220069',  
    lop: '22CT3 - NTO30103',                
    app_name: APP_NAME
  });
});

// ✅ GET /students - Lấy danh sách sinh viên
app.get('/students', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM students ORDER BY created_at DESC');
  res.json(rows);
});

// ✅ POST /students - Thêm sinh viên mới
app.post('/students', async (req, res) => {
  const { name, email } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const [result] = await db.execute(
    'INSERT INTO students (name, email) VALUES (?, ?)',
    [name, email]
  );
  res.status(201).json({ id: result.insertId, name, email });
});

// Khởi động server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`${APP_NAME} running on port ${PORT}`);
  });
}).catch(err => {
  console.error('DB connection failed:', err);
  process.exit(1);
});