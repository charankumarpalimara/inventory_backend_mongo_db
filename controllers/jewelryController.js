const Jewelry = require('../models/Jewelry');

// Helper function to convert image filenames to absolute URLs
const convertImageUrls = (jewelry) => {
  if (!jewelry.images || !Array.isArray(jewelry.images)) return jewelry;
  
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://inventory-backend-mongo-db.onrender.com' 
    : 'http://localhost:8080';
  
  const convertedImages = jewelry.images.map(imageFilename => {
    if (imageFilename.startsWith('http')) {
      return imageFilename; // Already absolute URL
    }
    // Convert filename to full URL
    return `${baseUrl}/uploads/${imageFilename}`;
  });
  
  return {
    ...jewelry.toObject(),
    images: convertedImages
  };
};

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

    // Convert image URLs to absolute URLs
    const jewelryWithAbsoluteUrls = jewelry.map(convertImageUrls);

    res.json({
      jewelry: jewelryWithAbsoluteUrls,
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
    res.json(convertImageUrls(jewelry));
  } catch (error) {
    console.error('Get jewelry by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new jewelry item
const createJewelry = async (req, res) => {
  try {
    // Handle uploaded files - store only filenames
    const imageFilenames = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        imageFilenames.push(file.filename);
      });
    }

    // Map frontend fields to backend model fields
    const jewelryData = {
      ...req.body,
      // Add uploaded image filenames only
      images: imageFilenames,
      // Ensure required fields have default values
      status: req.body.status || 'active',
      quantity: req.body.quantity || 1,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    };

    // Debug: Log the incoming data
    console.log('Creating jewelry with data:', {
      name: jewelryData.name,
      metalType: jewelryData.metalType,
      images: jewelryData.images,
      category: jewelryData.category,
      subtype: jewelryData.subtype
    });

    const jewelry = new Jewelry(jewelryData);
    await jewelry.save();
    res.status(201).json(convertImageUrls(jewelry));
  } catch (error) {
    console.error('Create jewelry error:', error);
    res.status(400).json({ 
      message: 'Validation error', 
      error: error.message,
      details: error.errors 
    });
  }
};

// Update jewelry item
const updateJewelry = async (req, res) => {
  try {
    // Handle uploaded files - store only filenames
    const imageFilenames = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        imageFilenames.push(file.filename);
      });
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      // Add uploaded image filenames if any
      ...(imageFilenames.length > 0 && { images: imageFilenames })
    };

    const jewelry = await Jewelry.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!jewelry) {
      return res.status(404).json({ message: 'Jewelry not found' });
    }
    res.json(convertImageUrls(jewelry));
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

// Bulk operations for jewelry
const bulkJewelryOperation = async (req, res) => {
  try {
    const { operation, jewelryIds, updateData } = req.body;

    if (!operation || !jewelryIds || !Array.isArray(jewelryIds)) {
      return res.status(400).json({ message: 'Invalid request. Operation and jewelryIds array are required.' });
    }

    let result;
    switch (operation) {
      case 'delete':
        result = await Jewelry.deleteMany({ _id: { $in: jewelryIds } });
        res.json({ 
          message: `${result.deletedCount} jewelry items deleted successfully`,
          deletedCount: result.deletedCount 
        });
        break;
        
      case 'update':
        if (!updateData) {
          return res.status(400).json({ message: 'Update data is required for bulk update operation.' });
        }
        result = await Jewelry.updateMany(
          { _id: { $in: jewelryIds } },
          { $set: updateData },
          { runValidators: true }
        );
        res.json({ 
          message: `${result.modifiedCount} jewelry items updated successfully`,
          modifiedCount: result.modifiedCount 
        });
        break;
        
      default:
        res.status(400).json({ message: 'Invalid operation. Supported operations: delete, update' });
    }
  } catch (error) {
    console.error('Bulk jewelry operation error:', error);
    res.status(500).json({ message: 'Server error during bulk operation' });
  }
};

const jewelryController = {
  getAllJewelry,
  getJewelryById,
  createJewelry,
  updateJewelry,
  deleteJewelry,
  getCategories,
  bulkJewelryOperation
};

module.exports = jewelryController;
