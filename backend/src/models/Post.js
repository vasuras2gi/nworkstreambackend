// Post model

import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // 1. Index for fast lookup of a user's posts (e.g., on the profile page)
      // index: true, 
      // NOTE: We'll use a compound index instead for better efficiency below
    },
    text: {
      type: String,
      required: true,
    },
    media: {
      data: Buffer,
      contentType: String,
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
  { timestamps: true } // Creates 'createdAt' and 'updatedAt' fields
);

// --------------------------------------------------------------------------
// 🎯 SCALABILITY IMPROVEMENT: ADDING INDEXES 
// --------------------------------------------------------------------------

// 1. Feed Sorting Index: Essential for your main feed and cursor pagination.
// This allows the query to efficiently sort by creation date (descending, -1).
PostSchema.index({ createdAt: -1 });


// 2. Profile Feed Index (Compound Index):
// This allows MongoDB to quickly find posts *by a specific user* AND *sort them*
// for the user's profile feed (e.g., get the latest posts for user X).
PostSchema.index({ user: 1, createdAt: -1 });


const Post = mongoose.model("Post", PostSchema);

export default Post;