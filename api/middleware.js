const validator = require('validator');
const jwt = require('jsonwebtoken');

const createUserValidation = (req, res, next) => {
  const { username, password } = req.body;
  if (
    !username ||
    !password ||
    validator.isEmpty(username) ||
    validator.isEmpty(password)
  ) {
    return res.status(400).json({ message: 'Missing required fields!' });
  }

  if (!validator.isAlphanumeric(username)) {
    return res.status(400).json({ message: 'Username must be alphanumeric!' });
  }

  if (!validator.isStrongPassword(password)) {
    return res.status(400).json({ message: 'Password is too weak!' });
  }

  next();
};

const loginUserValidation = (req, res, next) => {
  const { username, password } = req.body;
  if (
    !username ||
    !password ||
    validator.isEmpty(username) ||
    validator.isEmpty(password)
  ) {
    return res.status(400).json({ message: 'Missing required fields!' });
  }

  if (!validator.isAlphanumeric(username)) {
    return res.status(400).json({ message: 'Username must be alphanumeric!' });
  }

  next();
};

const generateToken = (id, username, role) => {
  const token = jwt.sign({ id, username, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1h',
  });
  return token;
};

const verifyToken = (req, res, next) => {
  // get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || validator.isEmpty(authHeader)) {
    return res.status(401).redirect('/views/');
  }
  
  const token = authHeader.split(' ')[1];

  // decode token
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  if (!decoded.id || !validator.isMongoId(decoded.id)) {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }
  req.body.userId = decoded.id;
  req.body.username = decoded.username;
  req.body.role = decoded.role;

  next();
};

const handleTokenExpiredError = (err, req, res, next) => {
  if (err instanceof jwt.TokenExpiredError) {
    // Inform the user that their token has expired
    return res.status(401).json({ message: 'Token has expired. Please log in again.' });
  }
  // If it's not a TokenExpiredError, proceed with regular error handling
  next(err);
};



module.exports =  { createUserValidation, loginUserValidation, verifyToken, generateToken, handleTokenExpiredError };
