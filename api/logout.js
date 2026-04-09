const createHandler = require('../lib/createHandler');
const { verifyToken } = require('../lib/middleware');
const { logout } = require('../lib/mongoServer');

module.exports = createHandler(app => {
  app.get('*', verifyToken, logout);
});
