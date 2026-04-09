const createHandler = require('../../lib/createHandler');
const { getProducts } = require('../../lib/mongoServer');

module.exports = createHandler(app => {
  app.get('*', getProducts);
});
