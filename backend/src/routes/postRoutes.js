import express from "express";
import Post from "../models/Post.js";
import upload from "../middleware/upload.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  createPost, 
  getAllPosts, 
  getPostById, 
  getPostsByUserId 
} from "../controllers/postController.js";

const router = express.Router();

// Route to the new createPost controller
router.post("/create-post", protectRoute, upload.single("file"), createPost);

router.get("/", protectRoute, getAllPosts);
router.get("/user/:userId", protectRoute, getPostsByUserId);
router.get("/:postId", protectRoute, getPostById);

export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id; 

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.put("/:postId/like", protectRoute, toggleLike);

export default router;