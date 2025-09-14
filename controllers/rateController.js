const Rate = require('../models/Rate');

// Get current rates
const getRates = async (req, res) => {
  try {
    const rates = await Rate.findOne().sort({ createdAt: -1 });
    
    if (!rates) {
      // Return default rates if none exist
      return res.json({
        success: true,
        rates: {
          gold: { price: 5500, lastUpdated: new Date().toISOString() },
          silver: { price: 75, lastUpdated: new Date().toISOString() }
        }
      });
    }

    res.json({
      success: true,
      rates: {
        gold: { price: rates.gold, lastUpdated: rates.updatedAt },
        silver: { price: rates.silver, lastUpdated: rates.updatedAt }
      }
    });
  } catch (error) {
    console.error('Get rates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update rates
const updateRates = async (req, res) => {
  try {
    const { gold, silver } = req.body;

    // Find existing rate or create new one
    let rate = await Rate.findOne().sort({ createdAt: -1 });
    
    if (!rate) {
      rate = new Rate({ gold, silver });
    } else {
      rate.gold = gold;
      rate.silver = silver;
    }

    await rate.save();

    res.json({
      success: true,
      message: 'Rates updated successfully',
      rates: {
        gold: { price: rate.gold, lastUpdated: rate.updatedAt },
        silver: { price: rate.silver, lastUpdated: rate.updatedAt }
      }
    });
  } catch (error) {
    console.error('Update rates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get rate history
const getRateHistory = async (req, res) => {
  try {
    const history = await Rate.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select('gold silver createdAt updatedAt');

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Get rate history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getRates,
  updateRates,
  getRateHistory
};
