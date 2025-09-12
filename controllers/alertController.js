const Jewelry = require('../models/Jewelry');

// Get low stock alerts
const getLowStockAlerts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    
    const lowStockItems = await Jewelry.find({
      quantity: { $lte: parseInt(threshold) }
    }).select('name sku category quantity');

    res.json({
      alerts: lowStockItems,
      count: lowStockItems.length,
      threshold: parseInt(threshold)
    });
  } catch (error) {
    console.error('Get low stock alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get out of stock alerts
const getOutOfStockAlerts = async (req, res) => {
  try {
    const outOfStockItems = await Jewelry.find({
      quantity: 0
    }).select('name sku category quantity');

    res.json({
      alerts: outOfStockItems,
      count: outOfStockItems.length
    });
  } catch (error) {
    console.error('Get out of stock alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all alerts
const getAllAlerts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    
    const lowStockItems = await Jewelry.find({
      quantity: { $lte: parseInt(threshold), $gt: 0 }
    }).select('name sku category quantity');

    const outOfStockItems = await Jewelry.find({
      quantity: 0
    }).select('name sku category quantity');

    res.json({
      lowStock: {
        items: lowStockItems,
        count: lowStockItems.length
      },
      outOfStock: {
        items: outOfStockItems,
        count: outOfStockItems.length
      },
      totalAlerts: lowStockItems.length + outOfStockItems.length
    });
  } catch (error) {
    console.error('Get all alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const alertController = {
  getLowStockAlerts,
  getOutOfStockAlerts,
  getAllAlerts
};

module.exports = alertController;
