const createHandler = require('../lib/createHandler');
const { verifyToken } = require('../lib/middleware');
const { unfavProduct } = require('../lib/mongoServer');

module.exports = createHandler(app => {
  app.delete('*', verifyToken, unfavProduct);
});
