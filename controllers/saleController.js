const Sale = require('../models/Sale');
const Jewelry = require('../models/Jewelry');

// Get all sales
const getAllSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sales = await Sale.find(query)
      .populate('jewelryId', 'name sku category')
      .populate('customerId', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ saleDate: -1 });

    const total = await Sale.countDocuments(query);

    res.json({
      sales,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get sale by ID
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('jewelryId', 'name sku category')
      .populate('customerId', 'name email');
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    console.error('Get sale by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new sale
const createSale = async (req, res) => {
  try {
    const { jewelryId, customerId, quantity, unitPrice, totalAmount, paymentMethod, notes } = req.body;

    // Check if jewelry exists and has enough stock
    const jewelry = await Jewelry.findById(jewelryId);
    if (!jewelry) {
      return res.status(404).json({ message: 'Jewelry not found' });
    }

    if (jewelry.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Create sale
    const sale = new Sale({
      jewelryId,
      customerId,
      quantity,
      unitPrice,
      totalAmount,
      paymentMethod,
      notes,
      saleDate: new Date()
    });

    await sale.save();

    // Update jewelry stock
    jewelry.quantity -= quantity;
    await jewelry.save();

    // Populate the response
    await sale.populate('jewelryId', 'name sku category');
    await sale.populate('customerId', 'name email');

    res.status(201).json(sale);
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update sale
const updateSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('jewelryId', 'name sku category')
     .populate('customerId', 'name email');
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete sale
const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Restore stock
    const jewelry = await Jewelry.findById(sale.jewelryId);
    if (jewelry) {
      jewelry.quantity += sale.quantity;
      await jewelry.save();
    }

    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get sales analytics
const getSalesAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = {};

    if (startDate && endDate) {
      matchStage.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const analytics = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' },
          averageSale: { $avg: '$totalAmount' },
          totalSalesCount: { $sum: 1 }
        }
      }
    ]);

    res.json(analytics[0] || {
      totalSales: 0,
      totalQuantity: 0,
      averageSale: 0,
      totalSalesCount: 0
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const saleController = {
  getAllSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  getSalesAnalytics
};

module.exports = saleController;
