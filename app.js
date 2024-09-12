const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

const UserRouter =  require('./routes/users.js');
const mongoApi = require('./api/mongoServer.js');

const app = express();
app.use(
  // enable cookies for cors
  cors({ 
    credentials: true,
  }),
);


app.listen(4000, () => {
  console.log("Server is up on port 3000");
});

// A middleware to parse cookies attached to the client's request.
app.use(cookieParser());

// These are built into Express and are used for parsing the body of incoming requests. They support JSON and URL-encoded data.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// A logging middleware that helps in debugging by logging requests details.
app.use(morgan(':method :url :status :response-time ms'));

// This serves static files like images, CSS files, and JavaScript files from the views directory.
app.use(express.static('views'));

// Define routes for our application:
app.use('', UserRouter);
app.set('view engine', 'ejs');

// This route catches any requests that do not match the routes defined above and returns a 404 error, indicating that the requested resource was not found.
app.all('*', (_req, res) => {
  return res.sendFile(path.join(__dirname, './views/404/'));
});

mongoApi.connectToDatabase();

module.exports = app;
