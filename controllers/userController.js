const User = require('../models/User');

const userController = {
  // Get all users (admin only)
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find({}).select('-password');
      
      res.json({
        success: true,
        users
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      });
    }
  },

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user'
      });
    }
  },

  // Create user (admin only)
  createUser: async (req, res) => {
    try {
      const { name, email, password, role, phone } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
      }

      // Create new user
      const user = new User({
        name,
        email,
        password,
        role: role || 'worker',
        phone: phone || ''
      });

      await user.save();

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: userResponse
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create user'
      });
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Find the user first
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Update user fields
      Object.keys(updates).forEach(key => {
        if (key !== 'password' && updates[key] !== undefined) {
          user[key] = updates[key];
        }
      });

      // Handle password update separately if provided
      if (updates.password && updates.password.trim() !== '') {
        user.password = updates.password; // This will trigger the pre-save middleware to hash it
      }

      // Save the user (this will trigger password hashing if password was modified)
      await user.save();

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        success: true,
        message: 'User updated successfully',
        user: userResponse
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user'
      });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      
      const user = await User.findByIdAndDelete(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete user'
      });
    }
  },

  // Toggle user active status
  toggleUserStatus: async (req, res) => {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      user.isActive = !user.isActive;
      await user.save();

      res.json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error('Toggle user status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to toggle user status'
      });
    }
  },

  // Bulk delete users
  bulkDeleteUsers: async (req, res) => {
    try {
      const { userIds } = req.body;
      
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'User IDs array is required'
        });
      }

      const result = await User.deleteMany({ _id: { $in: userIds } });
      
      res.json({
        success: true,
        message: `${result.deletedCount} users deleted successfully`
      });
    } catch (error) {
      console.error('Bulk delete users error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete users'
      });
    }
  }
};

module.exports = userController;