const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'Type' },
  description: String,
  price: { type: Number, required: true },
  image: String
});

module.exports = mongoose.model('Product', productSchema, 'Product');