const mongoose = require('mongoose');
const argon2 = require('argon2');
const { generateToken } = require('./middleware');

const User = require('../models/User');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Type = require('../models/Type');
require('dotenv').config();
const { MONGO_URL } = process.env;

/** Reuse one connection across Vercel serverless invocations (see mongoose Vercel docs). */
let dbPromise = null;

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    console.log('[DB] Already connected');
    return;
  }
  if (!MONGO_URL) {
    console.error('[DB] ERROR: MONGO_URL env var is not set');
    throw new Error('MONGO_URL is not set');
  }
  console.log('[DB] Connecting to MongoDB...');
  if (!dbPromise) {
    dbPromise = mongoose
      .connect(MONGO_URL, {
        serverSelectionTimeoutMS: 15000,
        maxPoolSize: 10,
      })
      .then(() => {
        console.log('[DB] Connected to MongoDB successfully');
      })
      .catch((err) => {
        console.error('[DB] Connection failed:', err.message);
        dbPromise = null;
        throw err;
      });
  }
  await dbPromise;
}

const register = async (req, res) => {
  // get credentials from body
  const { username, password, email, role } = req.body;

  try {
    // check if username already exists
    const duplicate = await User.findOne({ username }).lean().exec();
    if (duplicate) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // hash password
    const hashedPassword = await argon2.hash(password);

    // create user
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      role
    });

    // generate JWT token
    const token = generateToken(user._id, username, user.role);

    // send token in cookie
    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });

    // send token in response
    return res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  // get credentials from body
  const { username, password } = req.body;

  try {
    // check if username exists
    const user = await User.findOne({ username })
      .select('password role')
      .lean()
      .exec();
    if (!user) {
      return res.status(401).json({ message: 'Incorrect username' });
    }

    // check if password is correct
    const isPasswordCorrect = await argon2.verify(user.password, password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // generate JWT token
    const token = generateToken(user._id, username, user.role);

    // send token in cookie
    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
    const role = user.role;

    // send token in response
    return res.status(200).json({ token, role });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const logout = (_req, res) => {
  try {
    // clear cookie in browser;
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 9; // Number of products per page
    const skip = (page - 1) * pageSize;

    // Extract brand and type names from the query string
    const brands = Array.isArray(req.query.brand) ? req.query.brand : (req.query.brand ? [req.query.brand] : []);
    const types = Array.isArray(req.query.type) ? req.query.type : (req.query.type ? [req.query.type] : []);

  
    let query = {};

    if (brands.length > 0) {
      // Use map to execute asynchronous operations for each brand in parallel
      const brandIdsPromises = brands.map(async (brand) => {
        return await Brand.find({ name: brand }).distinct('_id');
      });

      // Wait for all promises to resolve
      const brandIdsArrays = await Promise.all(brandIdsPromises);

      // Flatten the array of arrays into a single array of brand IDs
      const brandIds = brandIdsArrays.flat();

      // Construct the query for brand IDs
      query.brand = { $in: brandIds };
    }

    if (types.length > 0) {
      // Use map to execute asynchronous operations for each brand in parallel
      const typeIdsPromises = types.map(async (type) => {
        return await Type.find({ name: type }).distinct('_id');
      });

      // Wait for all promises to resolve
      const typeIdsArrays = await Promise.all(typeIdsPromises);

      // Flatten the array of arrays into a single array of brand IDs
      const typeIds = typeIdsArrays.flat();

      // Construct the query for brand IDs
      query.type = { $in: typeIds };
    }

    const totalProductsCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProductsCount / pageSize);

    // Query products with filtered brand and type IDs
    const products = await Product.find(query)
      .skip(skip)
      .limit(pageSize)
      .select('name image price'); // Select only the name and image fields

    res.status(200).json({ products, totalPages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const productId = req.query.productId || req.params.productId;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid productId' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [brand, type] = await Promise.all([
      Brand.findOne({ _id: product.brand }),
      Type.findOne({ _id: product.type }),
    ]);

    if (!brand) return res.status(400).json({ message: 'Cannot find brand name' });
    if (!type) return res.status(400).json({ message: 'Cannot find type name' });

    return res.status(200).json({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      brand: { name: brand.name },
      type: { name: type.name },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getProductImage = async (req, res) => {
  try {
    const productId = req.query.productId;
    // Check if the productId is in a valid format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    // Find the product by its ID
    const product = await Product.findById(productId);

    // If no product exists with the given ID, return an error
    if (!product) {
      return res.status(400).json({ message: "No Product Found" });
    }

    // Return the product details
    return res.status(200).json({
      _id: product._id,
      name: product.name,
      image: product.image
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const favProduct = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ error: 'User ID and Product ID are required' });
    }


    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { favorites: productId } }, 
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Favorite product' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

const unfavProduct = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: 'User ID and Product ID are required' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { favorites: productId } }, 
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'Unfavorite product' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

const getFavList = async (req, res) => {
  try {
    const userId = req.body.userId;

    // Find the product by its ID
    const user = await User.findById(userId);

    // If no product exists with the given ID, return an error
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const favList = user.favorites;

    // Return the product details
    res.status(200).json(favList);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getUserList = async (req, res) => {
  try {
    // Check if the authenticated user is an admin
    if (req.body.role !== 'admin') {
      return res.status(403).redirect('/404/');
    }

    // Fetch all user accounts and their favorites list from the database
    const users = await User.find().select('-password');

    // Return the user data to the client
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}


module.exports = { connectToDatabase, 
                  register, 
                  login, 
                  logout, 
                  getProducts, 
                  favProduct, 
                  unfavProduct, 
                  getProductDetails, 
                  getFavList, 
                  getProductImage, 
                  getUserList
                };