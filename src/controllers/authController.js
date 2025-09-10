const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

// Controller cho việc đăng ký
exports.register = async (req, res) => {
  try {
    const { username, password, displayName, userType } = req.body;

    // Kiểm tra xem username đã tồn tại chưa
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Tên đăng nhập đã tồn tại." });
    }

    // Tạo user mới
    const newUser = await User.create({ username, password, displayName, userType });
    res.status(201).json({ message: "Đăng ký thành công!", user: newUser });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi đăng ký", error: error.message });
  }
};

// Controller cho việc đăng nhập
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Tìm user trong DB
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại." });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu không chính xác." });
    }

    // Xóa mật khẩu khỏi object user trước khi trả về
    delete user.password;

    res.status(200).json({ message: "Đăng nhập thành công!", user });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi đăng nhập", error: error.message });
  }
};
