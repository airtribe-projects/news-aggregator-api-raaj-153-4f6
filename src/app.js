/*
  app.js
  --------------
  Sets up the Express application, applies middleware (JSON parsing, CORS),
  and mounts route handlers for authentication and user preferences.
  Exports the configured Express app for use in server.js.
*/

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const preferencesRoutes = require('./routes/PreferencesRoutes');
const newsRoutes = require('./routes/newsRoutes');

const app = express();

app.use(express.json());

app.use(cors());
app.use("/auth", authRoutes);
app.use("/preferences", preferencesRoutes);
app.use('/news', newsRoutes);

module.exports = app;
