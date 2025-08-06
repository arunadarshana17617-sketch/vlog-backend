const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // This line is new

const app = express();
app.use(express.json());
app.use(cors()); // This line is new
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Define comment schema and model
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

// API Routes
// Get comments for a specific blog post
app.get('/api/comments/:blogId', async (req, res) => {
    try {
        const comments = await Comment.find({ blogId: req.params.blogId });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Post a new comment
app.post('/api/comments', async (req, res) => {
    const { blogId, author, text } = req.body;
    if (!blogId || !author || !text) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const comment = new Comment({
        blogId,
        author,
        text
    });

    try {
        const newComment = await comment.save();
        res.status(201).json(newComment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Post a reply to a comment
app.post('/api/comments/:id/replies', async (req, res) => {
    const { author, text } = req.body;
    if (!author || !text) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        comment.replies.push({ author, text });
        const updatedComment = await comment.save();
        res.json(updatedComment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a comment
app.delete('/api/comments/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        await comment.deleteOne();
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));