const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createAdminUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelry_inventory', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // Check if users already exist
    const existingUsers = await User.find({});
    if (existingUsers.length > 0) {
      console.log('Users already exist in database:');
      existingUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
      });
      return;
    }

    // Create test users
    const users = [
      {
        name: 'Super Admin',
        email: 'superadmin@jewelry.com',
        password: 'admin123',
        role: 'superadmin'
      },
      {
        name: 'Admin User',
        email: 'admin@jewelry.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Worker User',
        email: 'worker@jewelry.com',
        password: 'worker123',
        role: 'worker'
      }
    ];

    for (const userData of users) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user
      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      });

      await user.save();
      console.log(`Created user: ${userData.name} (${userData.email}) - Role: ${userData.role}`);
    }

    console.log('\nAll users created successfully!');
    console.log('\nLogin credentials:');
    console.log('Super Admin: superadmin@jewelry.com / admin123');
    console.log('Admin: admin@jewelry.com / admin123');
    console.log('Worker: worker@jewelry.com / worker123');

  } catch (error) {
    console.error('Error creating admin users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
createAdminUsers();
