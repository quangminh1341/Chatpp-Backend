// Import các thư viện cần thiết
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
require('dotenv').config(); // Để đọc file .env

// Import các module tự viết
const initializeSocket = require('./src/sockets/chatHandler');
// (Chúng ta sẽ thêm các routes sau)

// Khởi tạo app Express
const app = express();
const httpServer = http.createServer(app);

// Cấu hình Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Cho phép tất cả các domain kết nối, trong thực tế nên giới hạn lại
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors()); // Cho phép Cross-Origin Resource Sharing
app.use(express.json()); // Xử lý request body dạng JSON

// --- ROUTES API ---
// Ví dụ: app.use('/api/auth', authRoutes);

// --- SOCKET.IO CONNECTION ---
initializeSocket(io);

// Lấy port từ file .env hoặc mặc định là 3001
const PORT = process.env.PORT || 3025;

// Khởi động server
httpServer.listen(PORT, () => {
  console.log(`Backend server đang chạy tại http://localhost:${PORT}`);
});
