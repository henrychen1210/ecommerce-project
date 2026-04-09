const createHandler = require('../../../lib/createHandler');
const { getProductDetails } = require('../../../lib/mongoServer');

module.exports = createHandler(app => {
  app.get('*', getProductDetails);
});
