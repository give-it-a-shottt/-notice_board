const express = require('express');
const Post = require('../models/Post');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// List posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username')
      .populate('comments.author', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post
router.post('/', auth, async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body)
    return res.status(400).json({ message: 'Missing fields' });
  try {
    const post = new Post({ author: req.user._id, title, body });
    await post.save();
    const populated = await Post.findById(post._id)
      .populate('author', 'username')
      .populate('comments.author', 'username');
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comments', auth, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Missing content' });
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({ author: req.user._id, content });
    await post.save();
    const populated = await Post.findById(post._id).populate(
      'comments.author',
      'username',
    );
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit post
router.put('/:id', auth, async (req, res) => {
  const { title, body } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (title) post.title = title;
    if (body) post.body = body;
    await post.save();
    const populated = await Post.findById(post._id).populate(
      'author',
      'username',
    );
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    // use deleteOne to avoid issues with document.remove in some environments
    await Post.deleteOne({ _id: post._id });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    // remove the comment using $pull to avoid subdocument remove() issues
    await Post.updateOne(
      { _id: post._id },
      { $pull: { comments: { _id: comment._id } } },
    );
    const populated = await Post.findById(post._id).populate(
      'comments.author',
      'username',
    );
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit comment
router.put('/:postId/comments/:commentId', auth, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Missing content' });
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    // update the specific comment content atomically
    await Post.updateOne(
      { _id: post._id, 'comments._id': comment._id },
      { $set: { 'comments.$.content': content } },
    );
    const populated = await Post.findById(post._id).populate(
      'comments.author',
      'username',
    );
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
