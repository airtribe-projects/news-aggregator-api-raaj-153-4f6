/*
  server.js
  --------------
  Entry point for the Node.js application. Loads environment variables, sets up periodic news cache refresh,
  and starts the Express server on the configured port. The cache is refreshed every 15 minutes by calling getNews.
*/

const app = require("./app");
const dotenv = require("dotenv");
const { getNews } = require("./controllers/newsController");

dotenv.config();

const PORT = process.env.PORT || 5000;

const updateCachePeriodically = async () => {
  try {
    console.log("♻️ Refreshing cached news...");
    await getNews({}, { status: () => ({ json: () => {} }) }); // Dummy res
  } catch (err) {
    console.error("Failed to update cache:", err.message);
  }
};

setInterval(updateCachePeriodically, 15 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
