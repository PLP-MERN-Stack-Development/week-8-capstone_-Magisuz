const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const users = [
  { email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { email: 'user1@example.com', password: 'user1234', role: 'user' },
  { email: 'user2@example.com', password: 'user1234', role: 'user' },
  { email: 'user3@example.com', password: 'user1234', role: 'user' },
  { email: 'user4@example.com', password: 'user1234', role: 'user' },
  { email: 'user5@example.com', password: 'user1234', role: 'user' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB');

  // Remove existing users
  await User.deleteMany({});

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await User.create({ email: user.email, password: hashedPassword, role: user.role });
    console.log(`Created user: ${user.email}`);
  }

  await mongoose.disconnect();
  console.log('Seeding complete.');
}

seed().catch(err => {
  console.error(err);
  mongoose.disconnect();
}); 