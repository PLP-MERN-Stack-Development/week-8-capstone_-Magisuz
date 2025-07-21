const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  date: { type: String, required: true },
  partyName: { type: String, required: true },
  caseCode: { type: String, required: true },
  caseNumber: { type: String, required: true },
  caseYear: { type: String, required: true },
  lastActivity: { type: String, required: true },
  status: { type: String, enum: ['archived', 'retrieved', 'destroyed'], required: true },
  comingFrom: { type: String, required: true },
  destination: { type: String, required: true },
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('File', fileSchema); 