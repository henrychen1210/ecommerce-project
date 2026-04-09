const createHandler = require('../lib/createHandler');
const { loginUserValidation } = require('../lib/middleware');
const { login } = require('../lib/mongoServer');

module.exports = createHandler(app => {
  app.post('*', loginUserValidation, login);
});
