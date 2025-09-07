const User = require("../models/User");
const jwt = require("jsonwebtoken");

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { username, email, password, role } = req.body;

      // Check if user already exists by email or username
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return res.status(400).json({
          message: "User with this email or username already exists",
        });
      }

      // Create user (password will be hashed in User model pre-save hook)
      const user = new User({
        username,
        email,
        password,
        role: role || "employee",
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Compare password using User model method
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Update last login timestamp
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      // `req.user` already contains the user object (without password, from middleware)
      res.json(req.user);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { username, email } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user._id, // ✅ fixed from req.user.userId
        { username, email },
        { new: true, runValidators: true }
      ).select("-password");

      res.json({ message: "Profile updated successfully", user });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user._id);

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Set new password (will be hashed by pre-save middleware)
      user.password = newPassword;
      await user.save();

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}

module.exports = new AuthController();
