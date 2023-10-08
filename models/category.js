const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  subcategories: [
    {
      type: String,
    },
  ],
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
