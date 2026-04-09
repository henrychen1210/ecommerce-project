const createHandler = require('../lib/createHandler');
const { createUserValidation } = require('../lib/middleware');
const { register } = require('../lib/mongoServer');

module.exports = createHandler(app => {
  app.post('*', createUserValidation, register);
});
