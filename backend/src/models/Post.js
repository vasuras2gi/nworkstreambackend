import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    // 🔥 FIX: Now just a string that will hold the Cloudinary URL
    media: {
      type: String, 
      default: null,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

PostSchema.index({ createdAt: -1 });
PostSchema.index({ user: 1, createdAt: -1 });

const Post = mongoose.model("Post", PostSchema);

export default Post;