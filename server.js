// server.js (A simple example)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB Atlas
const uri = "mongodb+srv://arunadarshana17617:zAkru3sJTVVPyZnr@cluster0.lkuej68.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Comment Schema
const commentSchema = new mongoose.Schema({
  blogId: String,
  author: String,
  text: String,
  date: { type: Date, default: Date.now },
  replies: [{
    author: String,
    text: String,
    date: { type: Date, default: Date.now }
  }]
});

const Comment = mongoose.model('Comment', commentSchema);

// Middleware
app.use(express.json());
app.use(cors());

// API Endpoints
// GET all comments for a specific blog
app.get('/api/comments/:blogId', async (req, res) => {
  try {
    const comments = await Comment.find({ blogId: req.params.blogId });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST a new comment
app.post('/api/comments', async (req, res) => {
  try {
    const newComment = new Comment(req.body);
    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});