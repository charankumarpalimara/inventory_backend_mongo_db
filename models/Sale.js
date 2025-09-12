const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  // Sale Information
  saleNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  customer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  
  // Sale Items
  items: [{
    jewelry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Jewelry',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer', 'cheque'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'refunded'],
    default: 'pending'
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Additional Information
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'draft'
  },
  
  // User tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Generate sale number before saving
saleSchema.pre('save', async function(next) {
  if (this.isNew && !this.saleNumber) {
    const count = await this.constructor.countDocuments();
    this.saleNumber = `SALE-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Calculate totals before saving
saleSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    this.totalAmount = this.subtotal - this.discount + this.tax;
  }
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
