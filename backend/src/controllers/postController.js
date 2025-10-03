import Post from "../models/Post.js";

export const getAllPosts = async (req, res) => {
  try {
    // 1. Get query parameters
    const limit = parseInt(req.query.limit) || 10; // Default to 10 posts
    const cursor = req.query.cursor; // The _id of the last post received
    
    // 2. Build the query filter
    const filter = {};
    if (cursor) {
      // Fetch posts older than the cursor post
      filter._id = { $lt: cursor }; 
    }

    // 3. Execute the query with limit and sort
    const posts = await Post.find(filter)
      .populate("user", "fullName email profilePic")
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(limit);

    // 4. Determine the next cursor
    const hasMore = posts.length === limit;
    const nextCursor = hasMore ? posts[posts.length - 1]._id : null;
    
    // 5. Format posts (rest of your logic remains)
    const formattedPosts = posts.map((post) => {
      let base64Image = null;
      if (post.media?.data) {
        base64Image = `data:${post.media.contentType};base64,${post.media.data.toString("base64")}`;
      }

      return {
        ...post._doc,
        media: base64Image,
      };
    });

    // 6. Send the posts and the next cursor back
    res.status(200).json({
        posts: formattedPosts, 
        nextCursor: nextCursor, 
        hasMore: hasMore // Indicate if more posts are available
    });
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

    const formattedPosts = posts.map((post) => {
      let base64Image = null;
      if (post.media?.data) {
        base64Image = `data:${post.media.contentType};base64,${post.media.data.toString("base64")}`;
      }

      return {
        ...post._doc,
        media: base64Image,
      };
    });

    res.json(formattedPosts);
  } catch (error) {
    console.error("Error in getPostsByUserId:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single post by postId
export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId).populate(
      "user",
      "fullName email profilePic"
    );

    if (!post) return res.status(404).json({ message: "Post not found" });

    let base64Image = null;
    if (post.media?.data) {
      base64Image = `data:${post.media.contentType};base64,${post.media.data.toString("base64")}`;
    }

    res.json({
      ...post._doc,
      media: base64Image,
    });
  } catch (error) {
    console.error("Error in getPostById:", error);
    res.status(500).json({ message: "Server error" });
  }
};