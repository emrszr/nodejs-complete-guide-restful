const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");

const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  const totalItems = await Post.find().countDocuments();
  try {
    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 })
      .skip(perPage * (currentPage - 1))
      .limit(perPage);

    res.status(200).json({
      message: "Fetched post successfully",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statuCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }

  const imageUrl = req.file.path;
  const { title, content } = req.body;
  const post = Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });
  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    creator = user;
    await user.save();

    res.status(201).json({
      message: "Post created successfully!",
      post: post,
      creator: { _id: creator._id, name: creator.name },
    });
  } catch (err) {
    if (!err.statuCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Could not find the post");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "Post fetched", post: post });
  } catch (err) {
    if (!err.statuCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, image } = req.body;
  let imageUrl = image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error("No file picked.");
    error.statusCode = 422;
    throw error;
  }

  try {
    const post = await Post.findById(postId).populate("creator");
    if (!post) {
      const error = new Error("Could not find the post.");
      error.statusCode = 404;
      throw error;
    }
    console.log(post.creator);
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error("Not authorized.");
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;
    const result = await post.save();
    res.status(200).json({ message: "Post updated", post: post });
  } catch (err) {
    if (!err.statuCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);

    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not authorized.");
      error.statusCode = 403;
      throw error;
    }
    // check if the post has logged user.
    if (!post) {
      const error = new Error("Could not find the post.");
      error.statusCode = 404;
      throw error;
    }
    clearImage(post.imageUrl);
    await Post.findByIdAndDelete(postId);
    const user = await User.findById(req.userId);

    user.posts.pull(postId);
    await user.save();

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    if (!err.statuCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json({ status: user.status });
  } catch (err) {
    if (!err.statuCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.updateStatus = async (req, res, next) => {
  const { status } = req.body;

  try {
    let user = await User.findById(req.userId);

    user.status = status;
    user = await user.save();

    res.status(200).json({ status: user.status });
  } catch (err) {
    if (!err.statuCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
