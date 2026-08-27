import Post from "../models/Post.js";
import cloudinary from "../lib/cloudinary.js"; // Import your new config

// 1. NEW: The Create Post Controller
export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    const file = req.file; // This comes from multer memory storage

    if (!text && !file) {
      return res.status(400).json({ message: "Post must have text or file" });
    }

    let imageUrl = null;

    if (file) {
      // Convert multer buffer to a base64 DataURI for Cloudinary upload
      const b64 = Buffer.from(file.buffer).toString("base64");
      let dataURI = "data:" + file.mimetype + ";base64," + b64;
      
      // Upload directly to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        folder: "nwork_posts", // Keeps your cloudinary dashboard organized
      });

      // Get the secure CDN URL
      imageUrl = uploadResponse.secure_url;
    }

    const newPost = new Post({
      text,
      media: imageUrl, // 🔥 Save the URL instead of the buffer
      user: req.user.id,
    });

    await newPost.save();
    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 2. UPDATED: Clean, fast read controllers (No base64 mapping required!)
export const getAllPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4; 
    const cursor = req.query.cursor; 
    
    const filter = {};
    if (cursor) {
      filter._id = { $lt: cursor }; 
    }

    const posts = await Post.find(filter)
      .populate("user", "fullName email profilePic")
      .sort({ createdAt: -1 })
      .limit(limit);

    const hasMore = posts.length === limit;
    const nextCursor = hasMore ? posts[posts.length - 1]._id : null;
    
    res.status(200).json({ posts, nextCursor, hasMore });
  } catch (error) {
    console.error("Error fetching paginated posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPostsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ user: userId })
      .populate("user", "fullName email profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("Error in getPostsByUserId:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId).populate(
      "user",
      "fullName email profilePic"
    );

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (error) {
    console.error("Error in getPostById:", error);
    res.status(500).json({ message: "Server error" });
  }
};