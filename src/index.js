require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://magisuz:BeStill@cluster0.tmsysjl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

console.log('MongoDB URI:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const filesRouter = require('./routes/files');
const movementsRouter = require('./routes/movements');
const authRouter = require('./routes/auth');

app.use('/api/files', filesRouter);
app.use('/api/movements', movementsRouter);
app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
  res.send('Archives Management System Backend');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 