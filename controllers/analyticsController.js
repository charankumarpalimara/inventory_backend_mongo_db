const Jewelry = require('../models/Jewelry');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');

// Get comprehensive analytics
const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Set default date range if not provided
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Sales analytics
    const salesData = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalSales: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const sales = salesData[0] || { totalRevenue: 0, totalSales: 0, averageOrderValue: 0 };

    // Inventory analytics
    const inventoryData = await Jewelry.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalValue: { $sum: '$sellingPrice' },
          totalCost: { $sum: '$costPrice' },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ['$quantity', 5] }, 1, 0]
            }
          }
        }
      }
    ]);

    const inventory = inventoryData[0] || { totalItems: 0, totalValue: 0, totalCost: 0, lowStockItems: 0 };

    // Profit/Loss analytics
    const grossProfit = inventory.totalValue - inventory.totalCost;
    const profitMargin = inventory.totalValue > 0 ? (grossProfit / inventory.totalValue) * 100 : 0;

    const profitLoss = {
      totalRevenue: sales.totalRevenue,
      totalCost: inventory.totalCost,
      grossProfit,
      profitMargin
    };

    // Customer analytics
    const customerData = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          activeCustomers: {
            $sum: {
              $cond: [{ $gte: ['$lastPurchaseDate', start] }, 1, 0]
            }
          }
        }
      }
    ]);

    const customer = customerData[0] || { totalCustomers: 0, activeCustomers: 0 };

    // Monthly trends
    const monthlyTrends = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' }
          },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const trends = monthlyTrends.map(trend => ({
      month: new Date(trend._id.year, trend._id.month - 1).toLocaleDateString('en-US', { month: 'short' }),
      revenue: trend.revenue
    }));

    // Top selling items
    const topSelling = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: start, $lte: end }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $lookup: {
          from: 'jewelries',
          localField: 'items.jewelry',
          foreignField: '_id',
          as: 'jewelryItem'
        }
      },
      {
        $unwind: '$jewelryItem'
      },
      {
        $group: {
          _id: '$items.jewelry',
          jewelryItemName: { $first: '$jewelryItem.name' },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.totalPrice' }
        }
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Category breakdown
    const categoryBreakdown = await Jewelry.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryBreakdownObj = {};
    categoryBreakdown.forEach(cat => {
      categoryBreakdownObj[cat._id || 'uncategorized'] = cat.count;
    });

    // Metal type breakdown
    const metalTypeBreakdown = await Jewelry.aggregate([
      {
        $group: {
          _id: '$metalType',
          count: { $sum: 1 }
        }
      }
    ]);

    const metalTypeBreakdownObj = {};
    metalTypeBreakdown.forEach(metal => {
      metalTypeBreakdownObj[metal._id || 'unknown'] = metal.count;
    });

    res.json({
      success: true,
      analytics: {
        sales: {
          totalRevenue: sales.totalRevenue,
          totalSales: sales.totalSales,
          averageOrderValue: sales.averageOrderValue,
          sales: [] // Individual sales if needed
        },
        inventory: {
          totalItems: inventory.totalItems,
          totalValue: inventory.totalValue,
          inStock: inventory.totalItems - inventory.lowStockItems,
          lowStockItems: inventory.lowStockItems,
          categoryBreakdown: categoryBreakdownObj,
          metalTypeBreakdown: metalTypeBreakdownObj
        },
        profitLoss,
        customer: {
          totalCustomers: customer.totalCustomers,
          activeCustomers: customer.activeCustomers,
          newCustomers: 0, // Can be calculated based on creation date
          returningCustomers: customer.totalCustomers
        },
        monthlyTrends: {
          trends
        },
        topSelling: {
          items: topSelling
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAnalytics
};
