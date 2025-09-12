const Jewelry = require('../models/Jewelry');

// Get all jewelry items
const getAllJewelry = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const jewelry = await Jewelry.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Jewelry.countDocuments(query);

    res.json({
      jewelry,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get jewelry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get jewelry by ID
const getJewelryById = async (req, res) => {
  try {
    const jewelry = await Jewelry.findById(req.params.id);
    if (!jewelry) {
      return res.status(404).json({ message: 'Jewelry not found' });
    }
    res.json(jewelry);
  } catch (error) {
    console.error('Get jewelry by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new jewelry item
const createJewelry = async (req, res) => {
  try {
    const jewelry = new Jewelry(req.body);
    await jewelry.save();
    res.status(201).json(jewelry);
  } catch (error) {
    console.error('Create jewelry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update jewelry item
const updateJewelry = async (req, res) => {
  try {
    const jewelry = await Jewelry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!jewelry) {
      return res.status(404).json({ message: 'Jewelry not found' });
    }
    res.json(jewelry);
  } catch (error) {
    console.error('Update jewelry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete jewelry item
const deleteJewelry = async (req, res) => {
  try {
    const jewelry = await Jewelry.findByIdAndDelete(req.params.id);
    if (!jewelry) {
      return res.status(404).json({ message: 'Jewelry not found' });
    }
    res.json({ message: 'Jewelry deleted successfully' });
  } catch (error) {
    console.error('Delete jewelry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get jewelry categories
const getCategories = async (req, res) => {
  try {
    const categories = await Jewelry.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const jewelryController = {
  getAllJewelry,
  getJewelryById,
  createJewelry,
  updateJewelry,
  deleteJewelry,
  getCategories
};

module.exports = jewelryController;
