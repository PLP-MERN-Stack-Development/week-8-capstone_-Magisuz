const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const users = [
  { email: 'admin@example.com', password: 'admin123' },
  { email: 'user1@example.com', password: 'user1234' },
  { email: 'user2@example.com', password: 'user1234' },
  { email: 'user3@example.com', password: 'user1234' },
  { email: 'user4@example.com', password: 'user1234' },
  { email: 'user5@example.com', password: 'user1234' },
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
    await User.create({ email: user.email, password: hashedPassword });
    console.log(`Created user: ${user.email}`);
  }

  await mongoose.disconnect();
  console.log('Seeding complete.');
}

seed().catch(err => {
  console.error(err);
  mongoose.disconnect();
}); 