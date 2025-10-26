const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

const {readUsers, writeUsers} = require('../utils/userFileUtils');

const usersFile = path.join(__dirname, '../data/users.json');

exports.getNews = async (req, res) => {
  try {
    const users = await readUsers();
    const user = users.find(u => u.id === req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.preferences) return res.status(400).json({ message: 'No preferences found' });

    const { categories = [], languages = [] } = user.preferences;

    const language = languages[0] || 'en';
    const category = categories[0] || 'general';

    const API_KEY = process.env.NEWS_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ message: 'Missing NEWS_API_KEY in environment' });
    }

    const url = `https://newsapi.org/v2/top-headlines?language=${language}&category=${category}&apiKey=${API_KEY}`;

    const response = await axios.get(url);

    if (!response.data || !response.data.articles) {
      return res.status(502).json({ message: 'Invalid response from NewsAPI' });
    }

    return res.json({
      category,
      language,
      totalResults: response.data.totalResults,
      articles: response.data.articles.slice(0, 10) // limit to 10
    });

  } 
  catch (error) {
    console.error('Error fetching news:', error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        message: 'Failed to fetch news',
        error: error.response.data
      });
    }

    res.status(500).json({ message: 'Unexpected server error' });
  }
};
