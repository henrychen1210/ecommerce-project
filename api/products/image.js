const createHandler = require('../../lib/createHandler');
const { getProductImage } = require('../../lib/mongoServer');

module.exports = createHandler(app => {
  app.get('*', getProductImage);
});
