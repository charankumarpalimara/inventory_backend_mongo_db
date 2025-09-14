const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({
  gold: {
    type: Number,
    required: true,
    min: 0
  },
  silver: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Rate', rateSchema);
