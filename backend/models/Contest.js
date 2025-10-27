import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    duration: { type: Number, required: true },
    addedAt: { type: Date, default: Date.now },
    cfContestId: { type: String }, // Optional: Codeforces contest ID (e.g., "1234")
    problems: [
      {
        name: { type: String, required: true }, // e.g., "1234A", "567B"
        alpha: { type: String, required: true }, // e.g., "A", "B", "C"
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Contest", contestSchema);