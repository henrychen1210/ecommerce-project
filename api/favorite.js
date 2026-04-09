const createHandler = require('../lib/createHandler');
const { verifyToken } = require('../lib/middleware');
const { favProduct } = require('../lib/mongoServer');

module.exports = createHandler(app => {
  app.put('*', verifyToken, favProduct);
});
