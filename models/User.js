const mongoose = require('mongoose');
const { ObjectId } = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  favorites: [{ type: ObjectId, ref: 'Product' }],
  role: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema, 'User');