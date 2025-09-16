const mongoose = require('mongoose');

const jewelrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['rings', 'necklaces', 'earrings', 'bracelets', 'watches', 'other', 'jewelry', 'repair', 'order']
  },
  subtype: {
    type: String,
    trim: true
  },
  metalType: {
    type: String,
    trim: true
  },
  metalWeight: {
    type: Number,
    min: 0
  },
  stoneType: {
    type: String,
    trim: true
  },
  stoneWeight: {
    type: Number,
    min: 0
  },
  stoneCut: {
    type: String,
    trim: true
  },
  stoneClarity: {
    type: String,
    trim: true
  },
  stoneColor: {
    type: String,
    trim: true
  },
  stoneCount: {
    type: Number,
    min: 0
  },
  stoneCost: {
    type: Number,
    min: 0
  },
  makingCharges: {
    type: Number,
    min: 0
  },
  wastage: {
    type: Number,
    min: 0
  },
  laborCost: {
    type: Number,
    min: 0
  },
  otherCosts: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'sold'],
    default: 'active'
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  costPrice: {
    type: Number,
    min: 0
  },
  weight: {
    type: Number,
    min: 0
  },
  gemstone: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  minStockLevel: {
    type: Number,
    default: 5
  },
  markup: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for search functionality
jewelrySchema.index({ name: 'text', description: 'text', sku: 'text' });

module.exports = mongoose.model('Jewelry', jewelrySchema);
