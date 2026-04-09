const createHandler = require('../lib/createHandler');
const { verifyToken } = require('../lib/middleware');
const { getFavList } = require('../lib/mongoServer');

module.exports = createHandler(app => {
  app.get('*', verifyToken, getFavList);
});
