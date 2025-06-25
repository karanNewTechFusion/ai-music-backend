import mongoose from "mongoose";

const audioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    pitchData: {
      type: [Number],
      default: [],
    },
    stability: {
      type: Number,
    },
    projection: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: for faster querying by user
// audioSchema.index({ user_id: 1 });

export default mongoose.model("Audio", audioSchema);
