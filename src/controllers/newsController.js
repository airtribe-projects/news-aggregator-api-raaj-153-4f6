/*
  newsController.js
  -----------------
  Handles fetching news articles from an external API, caching them in memory,
  and serving them to users based on their preferences. Also provides endpoints
  for marking articles as read/favorite, retrieving read/favorite articles, and searching news.
  Includes error handling and periodic cache refresh logic.
*/

const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");

const {readUsers, writeUsers} = require('../utils/userFileUtils');

const usersFile = path.join(__dirname, "../data/users.json");

let cachedArticles = [];
let lastCacheTime = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// In-memory sets for read and favorite articles
let readArticles = new Set();
let favoriteArticles = new Set();

exports.getNews = async (req, res) => {
  try {
    const now = Date.now();
    // Serve from cache if valid
    if (
      cachedArticles.length > 0 &&
      lastCacheTime &&
      now - lastCacheTime < CACHE_DURATION
    ) {
      console.log("🟡 Serving news from cache...");
      return res.status(200).json({ articles: cachedArticles });
    }
    console.log("🔵 Fetching news from external API...");
    const users = await readUsers();
    const user = users.find(u => u.id === req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.preferences) return res.status(400).json({ message: 'No preferences found' });

    const { categories = [], languages = [] } = user.preferences;

    const language = languages[0] || 'en';
    const category = categories[0] || 'general';

    const API_KEY = process.env.NEWS_API_KEY;
    if (!API_KEY) {
      return res
        .status(500)
        .json({ message: "Missing NEWS_API_KEY in environment" });
    }

    const url = `https://newsapi.org/v2/top-headlines?language=${language}&category=${category}&apiKey=${API_KEY}`;

    const response = await axios.get(url);

    if (!response.data || !response.data.articles) {
      return res.status(502).json({ message: "Invalid response from NewsAPI" });
    }

    cachedArticles = response.data.articles;
    lastCacheTime = now;

    return res.json({
      category,
      language,
      totalResults: response.data.totalResults,
      articles: response.data.articles.slice(0, 10), // limit to 10
    });
  } catch (error) {
    console.error("Error fetching news:", error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        message: "Failed to fetch news",
        error: error.response.data,
      });
    }

    res.status(500).json({ message: "Unexpected server error" });
  }
};

exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  readArticles.add(id);
  res.status(200).json({ message: `Article ${id} marked as read` });
};

exports.markAsFavorite = async (req, res) => {
  const { id } = req.params;
  favoriteArticles.add(id);
  res.status(200).json({ message: `Article ${id} marked as favorite` });
};

exports.getReadArticles = async (req, res) => {
  // Use index as id for demo purposes
  const articles = cachedArticles.filter((_, index) =>
    readArticles.has(index.toString())
  );
  res.status(200).json(articles);
};

exports.getFavoriteArticles = async (req, res) => {
  const articles = cachedArticles.filter((_, index) =>
    favoriteArticles.has(index.toString())
  );
  res.status(200).json(articles);
};

exports.searchNews = async (req, res) => {
  const { keyword } = req.params;
  if (!keyword) return res.status(400).json({ error: "Keyword is required" });
  const results = cachedArticles.filter(
    (article) =>
      article.title?.toLowerCase().includes(keyword.toLowerCase()) ||
      article.description?.toLowerCase().includes(keyword.toLowerCase())
  );
  res.status(200).json(results);
};

// Export cachedArticles for use in newsActionsController
module.exports.cachedArticles = cachedArticles;
