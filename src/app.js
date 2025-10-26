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
