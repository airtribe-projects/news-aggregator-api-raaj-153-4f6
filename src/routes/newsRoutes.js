const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const {
  getNews,
  markAsRead,
  markAsFavorite,
  getReadArticles,
  getFavoriteArticles,
  searchNews,
} = require("../controllers/newsController");

// Main endpoints
router.get("/getNews", auth, getNews);

// Mark / retrieve read/favorite
router.post("/:id/read", auth, markAsRead);
router.post("/:id/favorite", auth, markAsFavorite);
router.get("/read", auth, getReadArticles);
router.get("/favorites", auth, getFavoriteArticles);
router.get("/search/:keyword", auth, searchNews);

module.exports = router;
