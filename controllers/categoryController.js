const Category = require('../models/category');
const Item = require('../models/Item')
// GET /api/categories
const path = require('path');
const fs = require('fs');
module.exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

module.exports.getCategoryProducts = async (req, res) => {
  const { categoryname } = req.params;
  
  try {
    // Find all items that match the specified category name
    const products = await Item.find({ category: categoryname });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
  
};
module.exports.addSubcategory = async (req, res) => {
  const { categoryId } = req.params;
  const { subcategoryName } = req.body;

  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if the subcategory already exists in the category's subcategories array
    if (category.subcategories.includes(subcategoryName)) {
      return res.status(400).json({ error: 'Subcategory already exists' });
    }

    // Add the new subcategory to the category's subcategories array
    category.subcategories.push(subcategoryName);
    await category.save();

    res.status(201).json({ message: 'Subcategory added successfully' });
  } catch (error) {
    console.error('Error adding subcategory:', error);
    res.status(500).json({ error: 'An error occurred while adding the subcategory' });
  }
};

module.exports.deleteCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { subcategoryName } = req.query;

  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (subcategoryName) {
      // Delete a subcategory
      const updatedSubcategories = category.subcategories.filter(
        (subcategory) => subcategory !== subcategoryName
      );

      category.subcategories = updatedSubcategories;
    } else {
      // Delete the entire category
       if (category.imageUrl) {
      const imagePath = path.join(__dirname, '..', 'public', category.imageUrl);
      console.log(imagePath)
      fs.unlink(imagePath, (error) => {
        if (error) {
          console.error('Error deleting category image file:', error);
        }
      });
    }

      await Category.findByIdAndDelete(categoryId);
    }

    await category.save();

    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'An error occurred while deleting the category' });
  }
};


