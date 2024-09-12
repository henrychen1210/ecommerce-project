const express = require('express');
const router = express.Router();
const mongoApi = require('../api/mongoServer.js');
const middle = require('../api/middleware.js');

/* GET users listing. */
router
  .post('/login', middle.loginUserValidation, mongoApi.login)
  .post('/register', middle.createUserValidation, mongoApi.register)
  .get('/logout', middle.verifyToken, mongoApi.logout)
  .put('/favorite', middle.verifyToken, mongoApi.favProduct)
  .delete('/unfavorite', middle.verifyToken, mongoApi.unfavProduct)
  .get('/products',  mongoApi.getProducts)
  .get('/products/details/:productId', mongoApi.getProductDetails)
  .get('/products/image', mongoApi.getProductImage)
  .get('/favlist', middle.verifyToken, mongoApi.getFavList)
  .get('/admin/user', middle.verifyToken, mongoApi.getUserList);

router.use(middle.handleTokenExpiredError);

module.exports = router;
